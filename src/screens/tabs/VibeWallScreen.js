import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchUnsplash } from '../../api/unsplash'; 
import { getApiKey, storeApiKey } from '../../utils/storage';
import DailyCard from '../../components/DailyCard';
import FilterChip from '../../components/FilterChip';
import ImageGrid from '../../components/ImageGrid';
import SettingsModal from '../../components/SettingsModal';
import CustomMenu from '../../components/CustomMenu';

export default function VibeWallScreen() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [dailyLandscape, setDailyLandscape] = useState(null);
  const [dailyPortrait, setDailyPortrait] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true); // 默认为 true，显示加载中
  
  const [searchQuery, setSearchQuery] = useState('');
  const [smartPlaceholder, setSmartPlaceholder] = useState('Search...');
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [searchOrientation, setSearchOrientation] = useState('portrait');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  // 🔥 核心修改 1: 合并初始化逻辑，只跑一次
  useEffect(() => {
    initPage();
  }, []);

  // 监听筛选方向变化
  useEffect(() => {
    if (searchQuery && searched) {
      performSearch(true);
    }
  }, [searchOrientation]);

  // 🔥 核心修改 2: 串行初始化
  const initPage = async () => {
    generateSmartSuggestions();
    
    // 1. 先拿到 Key
    const key = await getApiKey();
    setApiKey(key); // 存入 State (给后续搜索用)
    
    // 2. 立刻用这个 Key 刷新每日推荐 (不要等 State 更新)
    // 这样保证进页面就有数据
    await refreshDaily(key); 
  };

  const generateSmartSuggestions = () => { setSuggestedKeywords(["Cyberpunk", "Minimalist", "Nature", "Neon"]); setSmartPlaceholder("Search vibes..."); };
  
  // 🔥 核心修改 3: 支持传入 keyOverride
  const refreshDaily = async (keyOverride = null) => {
    setLoadingDaily(true);
    // 优先用传入的 Key，如果没有传，再用 State 里的 Key
    const validKey = keyOverride || apiKey;

    if (!validKey) {
        console.log("No API Key available yet.");
        setLoadingDaily(false);
        return;
    }

    // 并行请求两张图
    const [land, port] = await Promise.all([
        fetchUnsplash('/photos/random', { orientation: 'landscape', query: 'wallpaper' }, validKey),
        fetchUnsplash('/photos/random', { orientation: 'portrait', query: 'wallpaper' }, validKey)
    ]);

    if (land && !land.errors) setDailyLandscape(land);
    if (port && !port.errors) setDailyPortrait(port);
    
    setLoadingDaily(false);
  };

  const performSearch = async (resetPage = true) => {
    if (!searchQuery) return;
    setLoadingSearch(true);
    if (resetPage) { setSearchResults([]); setPage(1); setSearched(true); }
    
    const params = { query: searchQuery, page: resetPage ? 1 : page + 1, per_page: 10 };
    if (searchOrientation) params.orientation = searchOrientation;
    
    const data = await fetchUnsplash('/search/photos', params, apiKey);
    if (data && data.results) {
      if (resetPage) setSearchResults(data.results);
      else setSearchResults(prev => [...prev, ...data.results]);
      if (!resetPage) setPage(p => p + 1);
    }
    setLoadingSearch(false);
  };

  const handleSaveKey = async (k) => { 
      await storeApiKey(k); 
      setApiKey(k); 
      setShowSettings(false); 
      refreshDaily(k); // 保存后立即刷新
  };
  
  const openDetail = (photo) => router.push(`/vibewall/detail/${encodeURIComponent(JSON.stringify(photo))}`);

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
            <Text style={styles.sectionTitle}>Daily Picks</Text>
            <TouchableOpacity onPress={() => refreshDaily()}>
               <Ionicons name="refresh" size={16} color={loadingDaily ? "#cbd5e1" : "#6366f1"} style={loadingDaily ? {transform:[{rotate:'180deg'}]} : {}}/>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dailyScroll}>
            {/* 传递 loading 状态给卡片，或者直接显示 */}
            <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.dailyTouchWrapper}
                onPress={() => dailyLandscape && openDetail(dailyLandscape)}>
                {/* 这里的 DailyCard 内部有判断，如果 photo 为 null 会显示骨架屏 */}
                <DailyCard photo={dailyLandscape} type="Desktop" onDownload={() => openDetail(dailyLandscape)} width={260} height={150} />
            </TouchableOpacity>

            <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.dailyTouchWrapper}
                onPress={() => dailyPortrait && openDetail(dailyPortrait)}>
                <DailyCard photo={dailyPortrait} type="Mobile" onDownload={() => openDetail(dailyPortrait)} width={110} height={170} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" style={{marginLeft: 14}} />
            <TextInput 
              style={styles.input} placeholder={smartPlaceholder} placeholderTextColor="#cbd5e1"
              value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => performSearch(true)} returnKeyType="search"
            />
          </View>
          <View style={styles.filterRow}>
             <FilterChip label="Landscape" active={searchOrientation === 'landscape'} onPress={() => setSearchOrientation('landscape')} />
             <FilterChip label="Portrait" active={searchOrientation === 'portrait'} onPress={() => setSearchOrientation('portrait')} />
             <FilterChip label="All" active={searchOrientation === ''} onPress={() => setSearchOrientation('')} />
          </View>
          <View style={styles.keywordsRow}>
            {suggestedKeywords.map((w, i) => <TouchableOpacity key={i} onPress={() => {setSearchQuery(w);performSearch(true)}} style={styles.kChip}><Text style={styles.kText}>{w}</Text></TouchableOpacity>)}
          </View>
        </View>

        {searched && (
          <View style={styles.resultsSection}>
             <Text style={styles.sectionTitle}>Results</Text>
             {loadingSearch ? <ActivityIndicator size="large" color="#6366f1" /> : <ImageGrid results={searchResults} onDownload={openDetail} />}
             
             {searchResults.length > 0 && !loadingSearch && (
               <TouchableOpacity onPress={() => performSearch(false)} style={styles.loadMoreBtn}>
                 <Text style={styles.loadMoreText}>Next Batch</Text>
               </TouchableOpacity>
             )}
          </View>
        )}
        <View style={{height: 60}} /> 
      </ScrollView>

      <CustomMenu 
        visible={showMenu} 
        onClose={() => setShowMenu(false)} 
        onNavigateFav={() => router.push('/settings/favorites')}
        onNavigateDownloads={() => router.push('/settings/downloads')}
        onNavigateSettings={() => setShowSettings(true)} 
      />
      
      <SettingsModal visible={showSettings} currentKey={apiKey} onSave={handleSaveKey} onClose={() => setShowSettings(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center' },
  appTitle: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#0f172a' },
  appSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#64748b' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth:1, borderColor:'#f1f5f9' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140 },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#334155' },
  dailyScroll: { overflow: 'visible' },
  dailyTouchWrapper: { borderRadius: 20 }, 
  searchSection: { marginTop: 24 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 50 },
  input: { flex: 1, height: '100%', paddingHorizontal: 10, fontFamily: 'Poppins_400Regular', color: '#334155' },
  filterRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  kChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  kText: { fontSize: 11, color: '#64748b' },
  resultsSection: { marginTop: 30 },
  loadMoreBtn: { alignSelf: 'center', marginTop: 20, paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#fff', borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0' },
  loadMoreText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#6366f1' },
});