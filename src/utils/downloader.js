// 核心修改：这里改成从 'expo-file-system/legacy' 引入，或者尝试保持原样但忽略警告
// 为了稳妥，如果你是在最新版 Expo (SDK 52+)，请使用下面的写法：
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';

import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export const downloadImage = async (photoUrl, photoId) => {
  try {
    // 1. 设置文件路径
    const fileUri = documentDirectory + (photoId || Date.now()) + '.jpg';
    
    // 2. 下载 (使用解构出来的 downloadAsync)
    const downloadRes = await downloadAsync(photoUrl, fileUri);

    // 3. 申请权限
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === 'granted') {
      try {
        await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        return { success: true, method: 'save' };
      } catch (e) {
        console.log("Save failed, fallback to share", e);
        return await shareFile(downloadRes.uri);
      }
    } else {
      return await shareFile(downloadRes.uri);
    }

  } catch (error) {
    console.error("Download error:", error);
    // 这里做个容错，如果是 legacy 问题，提示用户
    return { success: false, error: "Download failed. API Error." };
  }
};

const shareFile = async (uri) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
    return { success: true, method: 'share' };
  }
  return { success: false, error: "Sharing not available" };
};