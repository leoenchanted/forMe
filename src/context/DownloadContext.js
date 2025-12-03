import React, { createContext, useState, useContext, useRef } from 'react';
// 保持 legacy 引入，兼容 Expo SDK 52
import * as FileSystem from 'expo-file-system/legacy'; 
import * as MediaLibrary from 'expo-media-library';

const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  // 用来存储下载任务的控制器，用于取消下载
  const downloadResumables = useRef({});
  
  // 全局通知状态 (替代 Alert)
  const [notification, setNotification] = useState({ visible: false, msg: '', type: 'info' });

  // 显示全局提示
  const showGlobalToast = (msg, type = 'info') => {
    setNotification({ visible: true, msg, type });
    // Toast 组件自己会处理自动消失，这里只需要负责设置状态
  };

  const hideGlobalToast = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // 开始下载
  const startDownload = async (photo) => {
    // 1. 检查重复
    const existingIndex = downloads.findIndex(t => t.id === photo.id);
    if (existingIndex >= 0) {
      const task = downloads[existingIndex];
      // 如果正在下载或正在保存，提示并退出
      if (task.status === 'downloading' || task.status === 'saving') {
        showGlobalToast("Already downloading this image...", 'info');
        return;
      }
      // 如果是已取消或失败的任务，从列表移除，准备重新下载
      setDownloads(prev => prev.filter(t => t.id !== photo.id));
    }

    // 2. 创建任务数据
    const task = {
      id: photo.id,
      url: photo.urls.full,
      thumbnail: photo.urls.small,
      progress: 0,
      written: '0.0',
      total: '0.0',
      status: 'downloading',
      fileName: `vibewall_${photo.id}.jpg`
    };

    setDownloads(prev => [task, ...prev]);

    try {
      // 3. 权限检查
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        updateTask(task.id, { status: 'error', errorMsg: 'No Permission' });
        showGlobalToast("Permission Denied", 'error');
        return;
      }

      const fileUri = FileSystem.documentDirectory + task.fileName;

      // 4. 创建可恢复/可取消的下载对象
      const downloadResumable = FileSystem.createDownloadResumable(
        task.url,
        fileUri,
        {},
        (downloadProgress) => {
          const totalBytes = downloadProgress.totalBytesExpectedToWrite;
          const writtenBytes = downloadProgress.totalBytesWritten;
          const progress = totalBytes > 0 ? writtenBytes / totalBytes : 0;
          const writtenMB = (writtenBytes / 1024 / 1024).toFixed(1);
          const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

          updateTask(task.id, { progress, written: writtenMB, total: totalMB });
        }
      );

      // 存入 ref，以便后续取消
      downloadResumables.current[task.id] = downloadResumable;

      // 5. 执行下载
      const result = await downloadResumable.downloadAsync();
      
      // 下载完了，从 ref 里移除
      delete downloadResumables.current[task.id];

      // 6. 保存到相册
      if (result) {
        updateTask(task.id, { status: 'saving', progress: 1 });
        try {
          await MediaLibrary.saveToLibraryAsync(result.uri);
          updateTask(task.id, { status: 'success' });
          // 可选：成功时也弹个轻提示
          // showGlobalToast("Saved to Gallery", 'success'); 
        } catch (saveErr) {
          console.error(saveErr);
          updateTask(task.id, { status: 'error', errorMsg: 'Save Failed' });
        }
      }

    } catch (e) {
      // 如果是用户主动取消，不算错误
      if (e.message && e.message.includes('aborted')) {
        console.log('Download cancelled by user');
      } else {
        console.error(e);
        updateTask(task.id, { status: 'error', errorMsg: 'Network Error' });
      }
    }
  };

  // 取消下载
  const cancelDownload = async (id) => {
    const resumable = downloadResumables.current[id];
    if (resumable) {
      try {
        await resumable.cancelAsync();
        delete downloadResumables.current[id];
        updateTask(id, { status: 'cancelled', errorMsg: 'Cancelled' });
        showGlobalToast("Download Cancelled", 'info');
      } catch (e) {
        console.error("Cancel failed", e);
      }
    }
  };

  const updateTask = (id, updates) => {
    setDownloads(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <DownloadContext.Provider value={{ 
      downloads, 
      startDownload, 
      cancelDownload, 
      notification, // 导出通知状态
      hideGlobalToast 
    }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => useContext(DownloadContext);