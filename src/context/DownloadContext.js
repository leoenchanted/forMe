import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy'; 
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DownloadContext = createContext();
const STORAGE_KEY = 'vibewall_downloads_v4'; // 再次升级Key，清洗旧数据

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  const [notification, setNotification] = useState({ visible: false, msg: '', type: 'info' });
  const downloadResumables = useRef({});

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          let history = JSON.parse(json);
          // 重启后所有下载中变为暂停
          history = history.map(item => 
            item.status === 'downloading' ? { ...item, status: 'paused' } : item
          );
          setDownloads(history);
        }
      } catch (e) { console.error(e); }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const saveHistory = async () => {
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(downloads)); } catch (e) {}
    };
    saveHistory();
  }, [downloads]);

  const showGlobalToast = (msg, type = 'info') => setNotification({ visible: true, msg, type });
  const hideGlobalToast = () => setNotification(prev => ({ ...prev, visible: false }));

  const startDownload = async (photo) => {
    const existing = downloads.find(t => t.id === photo.id);
    if (existing && existing.status !== 'success' && existing.status !== 'error') {
       if (existing.status === 'paused') resumeDownload(photo.id);
       else showGlobalToast("Already in queue", 'info');
       return;
    }

    const task = {
      id: photo.id,
      originalPhoto: photo,
      url: photo.urls.full,
      thumbnail: photo.urls.small,
      progress: 0,
      written: '0.0',
      total: '0.0',
      status: 'downloading',
      fileName: `vibewall_${photo.id}.jpg`,
      resumeSnapshot: null // 改名：存储暂停时的快照字符串
    };

    setDownloads(prev => [task, ...prev.filter(t => t.id !== photo.id)]);
    executeDownload(task);
  };

  const executeDownload = async (task, resumeDataString = null) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        updateTask(task.id, { status: 'error', errorMsg: 'Permission Denied' });
        return;
      }

      const fileUri = FileSystem.documentDirectory + task.fileName;

      // 🔥 核心修复点：resumeDataString 必须是字符串
      const downloadResumable = FileSystem.createDownloadResumable(
        task.url,
        fileUri,
        {}, 
        (progress) => {
           const totalBytes = progress.totalBytesExpectedToWrite;
           const writtenBytes = progress.totalBytesWritten;
           const p = totalBytes > 0 ? writtenBytes / totalBytes : 0;
           const wMB = (writtenBytes / 1024 / 1024).toFixed(1);
           const tMB = (totalBytes / 1024 / 1024).toFixed(1);
           updateTask(task.id, { progress: p, written: wMB, total: tMB });
        },
        resumeDataString // 👈 传入字符串，不要传对象！
      );

      downloadResumables.current[task.id] = downloadResumable;

      const result = await downloadResumable.downloadAsync();
      
      delete downloadResumables.current[task.id];

      if (result) {
        updateTask(task.id, { status: 'saving', progress: 1 });
        await MediaLibrary.saveToLibraryAsync(result.uri);
        updateTask(task.id, { status: 'success' });
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
      }

    } catch (e) {
      console.error("Download Error", e);
      delete downloadResumables.current[task.id];
      if (e.message && e.message.includes('aborted')) return;
      
      // 如果恢复失败，尝试降级重试（不带 resumeData）
      if (resumeDataString) {
          console.log("Resume failed, restarting...");
          return executeDownload(task, null);
      }
      updateTask(task.id, { status: 'error', errorMsg: 'Failed' });
    }
  };

  // ⏸️ 暂停
  const pauseDownload = async (id) => {
    const resumable = downloadResumables.current[id];
    if (resumable) {
      try {
        const pauseResult = await resumable.pauseAsync();
        // 🔥 关键：pauseResult 是一个对象 { url, fileUri, options, resumeData }
        // Android 需要里面的 resumeData 字符串
        // iOS 可能直接用整个对象序列化
        // 我们存整个对象的 JSON 字符串，恢复时再解析提取
        updateTask(id, { status: 'paused', resumeSnapshot: JSON.stringify(pauseResult) });
      } catch (e) { console.error(e); }
    } else {
        updateTask(id, { status: 'paused' });
    }
  };

  // ▶️ 恢复
  const resumeDownload = async (id) => {
    const task = downloads.find(t => t.id === id);
    if (!task) return;

    updateTask(id, { status: 'downloading', errorMsg: null });
    
    let resumeString = null;
    
    if (task.resumeSnapshot) {
        try {
            const snapshotObj = JSON.parse(task.resumeSnapshot);
            // 🔥 核心逻辑：提取 String
            // Android: snapshotObj.resumeData 是我们要的字符串
            // iOS: 有时候需要整个结构，但在 Expo SDK 50+ 中通常也只需要 resumeData
            if (Platform.OS === 'android') {
                resumeString = snapshotObj.resumeData; // 👈 Android 要这个 String
            } else {
                // iOS 尝试直接传 resumeData，如果不行则传整个对象的序列化
                resumeString = snapshotObj.resumeData || task.resumeSnapshot;
            }
            
            // 双重保险：如果 resumeData 字段不存在，说明可能存错了，直接重下
            if (!resumeString) {
                console.log("No valid resume string found, restarting");
                resumeString = null; 
            }
        } catch(e) {
            console.error("Parse resume data failed", e);
        }
    }

    executeDownload(task, resumeString);
  };

  const deleteTask = async (id) => {
    const resumable = downloadResumables.current[id];
    if (resumable) {
        try { await resumable.pauseAsync(); } catch(e){}
        delete downloadResumables.current[id];
    }
    const task = downloads.find(t => t.id === id);
    if (task) {
        const fileUri = FileSystem.documentDirectory + task.fileName;
        try { await FileSystem.deleteAsync(fileUri, { idempotent: true }); } catch(e){}
    }
    setDownloads(prev => prev.filter(t => t.id !== id));
    showGlobalToast("Task Deleted", 'info');
  };

  const updateTask = (id, updates) => {
    setDownloads(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <DownloadContext.Provider value={{ 
      downloads, startDownload, pauseDownload, resumeDownload, deleteTask, 
      notification, hideGlobalToast 
    }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => useContext(DownloadContext);