import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchUnsplash } from '../api/unsplash';
import { getApiKey, storeApiKey } from '../utils/storage';
import DailyCard from '../components/DailyCard';
import FilterChip from '../components/FilterChip';
import ImageGrid from '../components/ImageGrid';
import SettingsModal from '../components/SettingsModal';
import CustomMenu from '../components/CustomMenu';

export default function HomeScreen({ navigation }) {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [dailyLandscape, setDailyLandscape] = useState(null);
  const [dailyPortrait, setDailyPortrait] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [smartPlaceholder, setSmartPlaceholder] = useState('Search...');
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [searchOrientation, setSearchOrientation] = useState('portrait');
  
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { loadKey(); generateSmartSuggestions(); }, []);
  useEffect(() => { if (apiKey && !dailyLandscape) refreshDaily(); }, [apiKey]);

  // 核心修复：监听筛选方向变化，自动触发搜索
  useEffect(() => {
    if (searchQuery && searched) {
      performSearch(true);
    }
  }, [searchOrientation]);

  const loadKey = async () => {
    const key = await getApiKey();
    if (key) setApiKey(key); else setShowSettings(true);
  };

  const generateSmartSuggestions = () => { setSuggestedKeywords(["Cyberpunk", "Minimalist", "Nature"]); setSmartPlaceholder("Search vibes..."); };
  
  const refreshDaily = async () => {
    setLoadingDaily(true);
    const land = await fetchUnsplash('/photos/random', { orientation: 'landscape', query: 'wallpaper' }, apiKey);
    const port = await fetchUnsplash('/photos/random', { orientation: 'portrait', query: 'wallpaper' }, apiKey);
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

  const handleSaveKey = async (k) => { await storeApiKey(k); setApiKey(k); setShowSettings(false); };
  const openDetail = (photo) => navigation.navigate('Detail', { photo });

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
            <TouchableOpacity onPress={refreshDaily}>
               <Ionicons name="refresh" size={16} color={loadingDaily ? "#cbd5e1" : "#6366f1"} style={loadingDaily ? {transform:[{rotate:'180deg'}]} : {}}/>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dailyScroll}>
            <TouchableOpacity activeOpacity={0.9} style={styles.dailyTouchWrapper} onPress={() => dailyLandscape && openDetail(dailyLandscape)}>
                <DailyCard photo={dailyLandscape} type="Desktop" onDownload={() => openDetail(dailyLandscape)} width={260} height={150} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.dailyTouchWrapper} onPress={() => dailyPortrait && openDetail(dailyPortrait)}>
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
             {loadingSearch && page === 1 ? <ActivityIndicator size="large" color="#6366f1" /> : <ImageGrid results={searchResults} onDownload={openDetail} />}
             {searchResults.length > 0 && !loadingSearch && (
               <TouchableOpacity onPress={() => performSearch(false)} style={styles.loadMoreBtn}><Text style={styles.loadMoreText}>Load More</Text></TouchableOpacity>
             )}
          </View>
        )}
        <View style={{height: 60}} /> 
      </ScrollView>

      <CustomMenu 
        visible={showMenu} 
        onClose={() => setShowMenu(false)} 
        onNavigateFav={() => navigation.navigate('Favorites')}
        onNavigateSettings={() => setShowSettings(true)}
        onNavigateDownloads={() => navigation.navigate('Downloads')}
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
  scrollContent: { paddingHorizontal: 24 },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#334155' },
  dailyScroll: { overflow: 'visible' },
  dailyTouchWrapper: { borderRadius: 20 }, 
  searchSection: { marginTop: 24 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 50 },
  input: { flex: 1, height: '100%', paddingHorizontal: 10, fontFamily: 'Poppins_400Regular' },
  filterRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  kChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  kText: { fontSize: 11, color: '#64748b' },
  resultsSection: { marginTop: 30 },
  loadMoreBtn: { alignSelf: 'center', marginTop: 20, paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#fff', borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0' },
  loadMoreText: { color: '#6366f1', fontFamily: 'Poppins_600SemiBold' },
});