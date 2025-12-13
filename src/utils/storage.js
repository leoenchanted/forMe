import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // 引入这个来读取 app.config.js

const KEY_API = 'unsplash_access_key';
const KEY_FAVS = 'vibewall_favorites';

// 获取内置的 Key
const BUILT_IN_KEY = Constants.expoConfig?.extra?.unsplashApiKey || '';

export const getApiKey = async () => {
  try {
    // 1. 优先读取用户手动设置的 Key
    const customKey = await AsyncStorage.getItem(KEY_API);
    if (customKey) return customKey;
    
    // 2. 如果没填，返回内置的 Key (给朋友用的福利)
    return BUILT_IN_KEY;
  } catch (e) {
    return BUILT_IN_KEY; // 出错也返回内置的
  }
};

export const storeApiKey = async (key) => {
  try { 
    if (!key) {
        // 如果用户清空了输入框，就移除本地存储，下次自动回退到内置 Key
        await AsyncStorage.removeItem(KEY_API);
    } else {
        await AsyncStorage.setItem(KEY_API, key); 
    }
    return true; 
  } catch (e) { return false; } 
};

// ... 收藏夹的代码保持不变 ...
export const getFavorites = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEY_FAVS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch(e) { return []; }
};

export const toggleFavorite = async (photo) => {
  try {
    const currentFavs = await getFavorites();
    const existingIndex = currentFavs.findIndex(item => item.id === photo.id);
    
    let newFavs;
    let isFav;

    if (existingIndex >= 0) {
      // 已存在，删除
      newFavs = currentFavs.filter(item => item.id !== photo.id);
      isFav = false;
    } else {
      // 不存在，添加
      newFavs = [photo, ...currentFavs];
      isFav = true;
    }
    await AsyncStorage.setItem(KEY_FAVS, JSON.stringify(newFavs));
    return { newFavs, isFav };
  } catch (e) { console.error(e); return { newFavs: [], isFav: false }; }
};

export const checkIsFavorite = async (photoId) => {
  const currentFavs = await getFavorites();
  return currentFavs.some(item => item.id === photoId);
};