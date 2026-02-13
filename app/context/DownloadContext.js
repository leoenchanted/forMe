import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy'; // 注意：Expo SDK 50+ 建议使用 expo-file-system，legacy 可能在未来被移除，目前保持原样
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 引入你新写的 Toast Hook
import { useToast } from './ToastContext'; 

const DownloadContext = createContext();
const STORAGE_KEY = 'vibewall_downloads_v4';

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  const downloadResumables = useRef({});
  
  // 1. 获取 Toast 方法
  const { showToast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          let history = JSON.parse(json);
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

  // 原来的 showGlobalToast 和 hideGlobalToast 已删除

  const startDownload = async (photo) => {
    const existing = downloads.find(t => t.id === photo.id);
    if (existing && existing.status !== 'success' && existing.status !== 'error') {
       if (existing.status === 'paused') {
           resumeDownload(photo.id);
       } else {
           // 2. 使用新的 Toast
           showToast("Already in queue", 'info');
       }
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
      resumeSnapshot: null 
    };

    setDownloads(prev => [task, ...prev.filter(t => t.id !== photo.id)]);
    
    // 可选：开始下载时给个提示
    showToast("Download started", "success"); 
    executeDownload(task);
  };

  const executeDownload = async (task, resumeDataString = null) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        updateTask(task.id, { status: 'error', errorMsg: 'Permission Denied' });
        showToast("Permission Denied", "error"); // 建议：权限被拒时弹出提示
        return;
      }

      const fileUri = FileSystem.documentDirectory + task.fileName;

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
        resumeDataString 
      );

      downloadResumables.current[task.id] = downloadResumable;

      const result = await downloadResumable.downloadAsync();
      
      delete downloadResumables.current[task.id];

      if (result) {
        updateTask(task.id, { status: 'saving', progress: 1 });
        await MediaLibrary.saveToLibraryAsync(result.uri);
        updateTask(task.id, { status: 'success' });
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        // 可选：下载成功提示
        showToast("Saved to Gallery", "success"); 
      }

    } catch (e) {
      console.error("Download Error", e);
      delete downloadResumables.current[task.id];
      if (e.message && e.message.includes('aborted')) return;
      
      if (resumeDataString) {
          console.log("Resume failed, restarting...");
          return executeDownload(task, null);
      }
      updateTask(task.id, { status: 'error', errorMsg: 'Failed' });
      // 可选：失败提示
      showToast("Download Failed", "error");
    }
  };

  const pauseDownload = async (id) => {
    const resumable = downloadResumables.current[id];
    if (resumable) {
      try {
        const pauseResult = await resumable.pauseAsync();
        updateTask(id, { status: 'paused', resumeSnapshot: JSON.stringify(pauseResult) });
      } catch (e) { console.error(e); }
    } else {
        updateTask(id, { status: 'paused' });
    }
  };

  const resumeDownload = async (id) => {
    const task = downloads.find(t => t.id === id);
    if (!task) return;

    updateTask(id, { status: 'downloading', errorMsg: null });
    
    let resumeString = null;
    
    if (task.resumeSnapshot) {
        try {
            const snapshotObj = JSON.parse(task.resumeSnapshot);
            if (Platform.OS === 'android') {
                resumeString = snapshotObj.resumeData; 
            } else {
                resumeString = snapshotObj.resumeData || task.resumeSnapshot;
            }
            
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
    
    // 3. 使用新的 Toast
    showToast("Task Deleted", 'info');
  };

  const updateTask = (id, updates) => {
    setDownloads(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    // 4. Value 变得更干净，不再包含 notification 和 hideGlobalToast
    <DownloadContext.Provider value={{ 
      downloads, startDownload, pauseDownload, resumeDownload, deleteTask 
    }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => useContext(DownloadContext);