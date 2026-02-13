import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchUnsplash } from '../lib/api/unsplash'; 
import { getApiKey, storeApiKey, getFavorites, toggleFavorite } from '../lib/utils/storage';
import DailyCard from '../components/vibewall/DailyCard';
import ImageCard from '../components/vibewall/ImageCard';
import FilterChip from '../components/common/FilterChip';
import SettingsModal from '../components/common/SettingsModal';
import CustomMenu from '../components/common/CustomMenu';

const { width } = Dimensions.get('window');

// 更多分类标签
const ALL_CATEGORIES = [
  { id: 'cyberpunk', name: 'Cyberpunk', icon: 'flash' },
  { id: 'minimalist', name: 'Minimalist', icon: 'square' },
  { id: 'nature', name: 'Nature', icon: 'leaf' },
  { id: 'neon', name: 'Neon', icon: 'color-wand' },
  { id: 'anime', name: 'Anime', icon: 'happy' },
  { id: 'architecture', name: 'Architecture', icon: 'business' },
  { id: 'space', name: 'Space', icon: 'planet' },
  { id: 'ocean', name: 'Ocean', icon: 'water' },
  { id: 'mountain', name: 'Mountain', icon: 'triangle' },
  { id: 'abstract', name: 'Abstract', icon: 'shapes' },
];

export default function VibeWallScreen() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [dailyLandscape, setDailyLandscape] = useState(null);
  const [dailyPortrait, setDailyPortrait] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchOrientation, setSearchOrientation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 初始化
  useEffect(() => {
    initPage();
  }, []);

  // 监听筛选方向变化
  useEffect(() => {
    if (searchQuery && searched) {
      performSearch(true);
    }
  }, [searchOrientation]);

  const initPage = async () => {
    const [key, favs] = await Promise.all([
      getApiKey(),
      getFavorites(),
    ]);
    
    setApiKey(key);
    setFavorites(favs);
    await refreshDaily(key);
  };

  const refreshDaily = async (keyOverride = null) => {
    setLoadingDaily(true);
    const validKey = keyOverride || apiKey;

    if (!validKey) {
      setLoadingDaily(false);
      return;
    }

    const [land, port] = await Promise.all([
      fetchUnsplash('/photos/random', { orientation: 'landscape', query: 'wallpaper' }, validKey),
      fetchUnsplash('/photos/random', { orientation: 'portrait', query: 'wallpaper' }, validKey)
    ]);

    if (land && !land.errors) setDailyLandscape(land);
    if (port && !port.errors) setDailyPortrait(port);
    
    setLoadingDaily(false);
  };

  const performSearch = async (resetPage = true) => {
    const query = searchQuery || selectedCategory;
    if (!query) return;
    
    setLoadingSearch(true);
    if (resetPage) { 
      setSearchResults([]); 
      setPage(1); 
      setSearched(true); 
    }
    
    const params = { 
      query: query, 
      page: resetPage ? 1 : page + 1, 
      per_page: 20 
    };
    if (searchOrientation) params.orientation = searchOrientation;
    
    const data = await fetchUnsplash('/search/photos', params, apiKey);
    if (data && data.results) {
      if (resetPage) setSearchResults(data.results);
      else setSearchResults(prev => [...prev, ...data.results]);
      if (!resetPage) setPage(p => p + 1);
    }
    setLoadingSearch(false);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
    setSearchQuery(category.name);
    performSearch(true);
  };

  const handleToggleFavorite = async (photo) => {
    const { newFavs, isFav } = await toggleFavorite(photo);
    setFavorites(newFavs);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDaily();
    setRefreshing(false);
  };

  const handleSaveKey = async (k) => { 
    await storeApiKey(k); 
    setApiKey(k); 
    setShowSettings(false); 
    refreshDaily(k);
  };
  
  const openDetail = (photo) => router.push(`/vibewall/detail/${encodeURIComponent(JSON.stringify(photo))}`);

  // 瀑布流布局：将数据分成两列
  const getColumns = () => {
    const left = [];
    const right = [];
    searchResults.forEach((item, index) => {
      if (index % 2 === 0) left.push(item);
      else right.push(item);
    });
    return { left, right };
  };

  const { left, right } = getColumns();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>VibeWall</Text>
          <Text style={styles.appSubtitle}>Find your inspiration</Text>
        </View>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.iconBtn}>
          <Ionicons name="grid-outline" size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 每日推荐 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Picks</Text>
            <TouchableOpacity onPress={() => refreshDaily()}>
              <Ionicons 
                name="refresh" 
                size={18} 
                color={loadingDaily ? "#cbd5e1" : "#6366f1"} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dailyScroll}
            contentContainerStyle={styles.dailyScrollContent}
          >
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.dailyTouchWrapper}
              onPress={() => dailyLandscape && openDetail(dailyLandscape)}>
              <DailyCard 
                photo={dailyLandscape} 
                type="Desktop" 
                onDownload={() => openDetail(dailyLandscape)} 
                width={260} 
                height={150} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.dailyTouchWrapper}
              onPress={() => dailyPortrait && openDetail(dailyPortrait)}>
              <DailyCard 
                photo={dailyPortrait} 
                type="Mobile" 
                onDownload={() => openDetail(dailyPortrait)} 
                width={110} 
                height={170} 
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 搜索区域 */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Search wallpapers..."
              placeholderTextColor="#cbd5e1"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSelectedCategory(null);
              }}
              onSubmitEditing={() => performSearch(true)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSearched(false);
                setSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* 方向筛选 */}
          <View style={styles.filterRow}>
            <FilterChip 
              label="All" 
              active={searchOrientation === ''} 
              onPress={() => setSearchOrientation('')} 
            />
            <FilterChip 
              label="Portrait" 
              active={searchOrientation === 'portrait'} 
              onPress={() => setSearchOrientation('portrait')} 
            />
            <FilterChip 
              label="Landscape" 
              active={searchOrientation === 'landscape'} 
              onPress={() => setSearchOrientation('landscape')} 
            />
          </View>

          {/* 分类标签 */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.name && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Ionicons 
                  name={cat.icon} 
                  size={12} 
                  color={selectedCategory === cat.name ? '#fff' : '#64748b'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.name && styles.categoryTextActive
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 搜索结果 - 瀑布流布局 */}
        {searched && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              Results ({searchResults.length})
            </Text>
            
            {loadingSearch && searchResults.length === 0 ? (
              <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
            ) : (
              <>
                <View style={styles.masonryGrid}>
                  {/* 左列 */}
                  <View style={styles.column}>
                    {left.map((photo, index) => (
                      <ImageCard
                        key={photo.id}
                        photo={photo}
                        index={index * 2}
                        isFavorite={favorites.some(f => f.id === photo.id)}
                        onPress={() => openDetail(photo)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </View>
                  
                  {/* 右列 */}
                  <View style={styles.column}>
                    {right.map((photo, index) => (
                      <ImageCard
                        key={photo.id}
                        photo={photo}
                        index={index * 2 + 1}
                        isFavorite={favorites.some(f => f.id === photo.id)}
                        onPress={() => openDetail(photo)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </View>
                </View>
                
                {searchResults.length > 0 && !loadingSearch && (
                  <TouchableOpacity 
                    onPress={() => performSearch(false)} 
                    style={styles.loadMoreBtn}
                  >
                    <Text style={styles.loadMoreText}>Load More</Text>
                    <Ionicons name="chevron-down" size={16} color="#6366f1" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomMenu 
        visible={showMenu} 
        onClose={() => setShowMenu(false)} 
        onNavigateFav={() => router.push('/settings/favorites')}
        onNavigateDownloads={() => router.push('/settings/downloads')}
        onNavigateSettings={() => setShowSettings(true)} 
      />
      
      <SettingsModal 
        visible={showSettings} 
        currentKey={apiKey} 
        onSave={handleSaveKey} 
        onClose={() => setShowSettings(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  appTitle: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#0f172a' 
  },
  appSubtitle: { 
    fontSize: 13, 
    color: '#64748b',
    marginTop: 2,
  },
  iconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 140 
  },
  section: { 
    marginTop: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#334155' 
  },
  dailyScroll: { 
    overflow: 'visible',
  },
  dailyScrollContent: {
    gap: 12,
  },
  dailyTouchWrapper: { 
    borderRadius: 20,
  }, 
  searchSection: { 
    marginTop: 24 
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: { 
    flex: 1, 
    height: '100%', 
    fontSize: 15,
    color: '#334155' 
  },
  filterRow: { 
    flexDirection: 'row', 
    marginTop: 12, 
    gap: 8 
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsSection: { 
    marginTop: 30 
  },
  loader: {
    marginTop: 40,
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  column: {
    flex: 1,
  },
  loadMoreBtn: { 
    alignSelf: 'center', 
    marginTop: 24, 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    backgroundColor: '#fff', 
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#6366f1' 
  },
});
