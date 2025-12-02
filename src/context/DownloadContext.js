import React, { createContext, useState, useContext } from 'react';
// 保持之前的 legacy 引入，防止报错
import * as FileSystem from 'expo-file-system/legacy'; 
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);

  const startDownload = async (photo) => {
    const task = {
      id: photo.id,
      url: photo.urls.full,
      thumbnail: photo.urls.small,
      progress: 0,
      written: '0.0', // 新增：已下载大小
      total: '0.0',   // 新增：总大小
      status: 'downloading',
      fileName: `vibewall_${photo.id}.jpg`
    };

    setDownloads(prev => [task, ...prev]);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      
      if (status !== 'granted') {
        updateTask(task.id, { status: 'error', errorMsg: 'No Permission' });
        return;
      }

      const fileUri = FileSystem.documentDirectory + task.fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        task.url,
        fileUri,
        {},
        (downloadProgress) => {
          // 核心修改：计算进度和具体的 MB 数值
          const totalBytes = downloadProgress.totalBytesExpectedToWrite;
          const writtenBytes = downloadProgress.totalBytesWritten;
          
          const progress = totalBytes > 0 ? writtenBytes / totalBytes : 0;
          
          // 换算成 MB，保留1位小数
          const writtenMB = (writtenBytes / 1024 / 1024).toFixed(1);
          const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

          updateTask(task.id, { 
            progress: progress,
            written: writtenMB,
            total: totalMB
          });
        }
      );

      const result = await downloadResumable.downloadAsync();

      updateTask(task.id, { status: 'saving', progress: 1 });
      
      try {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        updateTask(task.id, { status: 'success' });
      } catch (saveErr) {
        console.error(saveErr);
        updateTask(task.id, { status: 'error', errorMsg: 'Save Failed' });
      }

    } catch (e) {
      console.error(e);
      updateTask(task.id, { status: 'error', errorMsg: 'Network Error' });
    }
  };

  const updateTask = (id, updates) => {
    setDownloads(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <DownloadContext.Provider value={{ downloads, startDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => useContext(DownloadContext);