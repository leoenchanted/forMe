import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const KEY_API = 'unsplash_access_key';
const KEY_FAVS = 'vibewall_favorites';
const KEY_USERNAME = 'username';
const KEY_THEME_MODE = 'theme_mode';
const KEY_ZODIAC_SIGN = 'zodiac_sign';
const KEY_CACHE_CLEAN = 'last_cache_clean';
const KEY_HOME_BG = 'home_bg';

const BUILT_IN_KEY = Constants.expoConfig?.extra?.unsplashApiKey || '';

// ============ API Key ============
export const getApiKey = async () => {
  try {
    const customKey = await AsyncStorage.getItem(KEY_API);
    if (customKey) return customKey;
    return BUILT_IN_KEY;
  } catch (e) {
    return BUILT_IN_KEY;
  }
};

export const storeApiKey = async (key) => {
  try { 
    if (!key) {
      await AsyncStorage.removeItem(KEY_API);
    } else {
      await AsyncStorage.setItem(KEY_API, key); 
    }
    return true; 
  } catch (e) { return false; } 
};

// ============ Favorites ============
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
      newFavs = currentFavs.filter(item => item.id !== photo.id);
      isFav = false;
    } else {
      newFavs = [photo, ...currentFavs];
      isFav = true;
    }
    await AsyncStorage.setItem(KEY_FAVS, JSON.stringify(newFavs));
    return { newFavs, isFav };
  } catch (e) { 
    console.error(e); 
    return { newFavs: [], isFav: false }; 
  }
};

export const checkIsFavorite = async (photoId) => {
  const currentFavs = await getFavorites();
  return currentFavs.some(item => item.id === photoId);
};

// ============ Username ============
export const getUsername = async () => {
  try {
    return await AsyncStorage.getItem(KEY_USERNAME) || 'User';
  } catch (e) {
    return 'User';
  }
};

export const setUsername = async (username) => {
  try {
    await AsyncStorage.setItem(KEY_USERNAME, username);
    return true;
  } catch (e) {
    console.error('保存用户名失败:', e);
    return false;
  }
};

// ============ Theme Mode ============
export const getThemeMode = async () => {
  try {
    return await AsyncStorage.getItem(KEY_THEME_MODE) || 'system';
  } catch (e) {
    return 'system';
  }
};

export const setThemeMode = async (mode) => {
  try {
    await AsyncStorage.setItem(KEY_THEME_MODE, mode);
    return true;
  } catch (e) {
    return false;
  }
};

// ============ Zodiac Sign ============
export const getZodiacSign = async () => {
  try {
    return await AsyncStorage.getItem(KEY_ZODIAC_SIGN) || 'aries';
  } catch (e) {
    return 'aries';
  }
};

export const setZodiacSign = async (sign) => {
  try {
    await AsyncStorage.setItem(KEY_ZODIAC_SIGN, sign);
    return true;
  } catch (e) {
    return false;
  }
};

// ============ Cache Management ============
export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToKeep = [
      KEY_USERNAME,
      KEY_THEME_MODE,
      KEY_ZODIAC_SIGN,
      KEY_API,
      KEY_FAVS,
    ];
    const keysToRemove = keys.filter(key => !keysToKeep.includes(key));
    await AsyncStorage.multiRemove(keysToRemove);
    await AsyncStorage.setItem(KEY_CACHE_CLEAN, new Date().toISOString());
    return true;
  } catch (e) {
    console.error('清理缓存失败:', e);
    return false;
  }
};

export const getCacheInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    let totalSize = 0;
    items.forEach(([key, value]) => {
      if (value) {
        totalSize += value.length * 2;
      }
    });
    const lastClean = await AsyncStorage.getItem(KEY_CACHE_CLEAN);
    return {
      size: (totalSize / 1024).toFixed(2),
      count: keys.length,
      lastClean: lastClean ? new Date(lastClean).toLocaleDateString() : null,
    };
  } catch (e) {
    return { size: '0', count: 0, lastClean: null };
  }
};

// ============ Home Background ============
export const getHomeBg = async () => {
  try {
    const bg = await AsyncStorage.getItem(KEY_HOME_BG);
    if (bg && bg.startsWith('file://')) {
      return bg;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const setHomeBg = async (uri) => {
  try {
    await AsyncStorage.setItem(KEY_HOME_BG, uri);
    return true;
  } catch (e) {
    return false;
  }
};
