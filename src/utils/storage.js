import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_API = 'unsplash_access_key';
const KEY_FAVS = 'vibewall_favorites';

export const getApiKey = async () => {
  try { return await AsyncStorage.getItem(KEY_API); } catch (e) { return null; }
};

export const storeApiKey = async (key) => {
  try { await AsyncStorage.setItem(KEY_API, key); return true; } catch (e) { return false; }
};

// --- 收藏夹逻辑 ---

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