import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { useDownloads } from '../context/DownloadContext';
import { toggleFavorite, checkIsFavorite, getApiKey } from '../utils/storage';
import { fetchUnsplash } from '../api/unsplash'; // 引入请求工具
import Toast from '../components/Toast';

const { width, height } = Dimensions.get('window');

export default function DetailScreen({ route, navigation }) {
  const { photo: initialPhoto } = route.params; // 重命名为初始数据
  const [photo, setPhoto] = useState(initialPhoto); // 用 state 存储数据，方便更新
  
  const { startDownload } = useDownloads();
  const [isFav, setIsFav] = useState(false);
  
  // Toast 状态
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    checkFavStatus();
    loadFullStats(); // 加载完整数据(包含浏览量)
  }, []);

  const loadFullStats = async () => {
    const apiKey = await getApiKey();
    // 请求单张图片详情
    const data = await fetchUnsplash(`/photos/${initialPhoto.id}`, {}, apiKey);
    if (data && !data.errors) {
      setPhoto(data); // 更新 UI 显示完整数据
    }
  };

  const checkFavStatus = async () => {
    const status = await checkIsFavorite(photo.id);
    setIsFav(status);
  };

  const handleFav = async () => {
    const { isFav: newStatus } = await toggleFavorite(photo);
    setIsFav(newStatus);
    showToast(newStatus ? "Added to Collection" : "Removed from Collection");
  };

  const handleDownload = () => {
    startDownload(photo);
    showToast("Added to Download Queue!", 'success');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(photo.links.html);
    showToast("Link Copied!");
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Image source={{ uri: photo.urls.regular }} style={styles.fullImage} />

      {/* 顶部按钮 */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFav} style={styles.iconBtn}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#f87171" : "#fff"} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* 底部信息 */}
      <LinearGradient colors={['transparent', '#000']} style={styles.bottomOverlay}>
        <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{photo.description || photo.alt_description || "Untitled"}</Text>
            
            <View style={styles.metaRow}>
                <View style={styles.userSection}>
                    <Image source={{ uri: photo.user.profile_image.medium }} style={styles.avatar} />
                    <Text style={styles.username}>{photo.user.name}</Text>
                </View>
                <TouchableOpacity onPress={handleCopyLink} style={styles.copyBtn}>
                    <Ionicons name="link" size={16} color="#fff" />
                    <Text style={{color:'#fff', fontSize:10, fontFamily:'Poppins_600SemiBold'}}>LINK</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
                {/* 这里的 views 现在会自动更新显示了 */}
                <StatItem icon="eye" value={photo.views} label="Views" />
                <StatItem icon="heart" value={photo.likes} label="Likes" />
                <StatItem icon="scan" value={`${photo.width}x${photo.height}`} label="Res" />
            </View>

            <TouchableOpacity onPress={handleDownload} style={styles.downloadBtn} activeOpacity={0.8}>
              <Text style={styles.downloadText}>Download Wallpaper</Text>
              <Ionicons name="arrow-down-circle" size={24} color="#000" />
            </TouchableOpacity>
            
            <Text style={styles.license}>Free to use under Unsplash License</Text>
        </View>
      </LinearGradient>

      <Toast visible={toastVisible} message={toastMsg} type={toastType} onHide={() => setToastVisible(false)} />
    </View>
  );
}

const StatItem = ({ icon, value, label }) => (
    <View style={styles.statItem}>
        <Ionicons name={icon} size={18} color="#94a3b8" />
        <View>
            <Text style={styles.statValue}>{value ? value.toLocaleString() : '-'}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fullImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  
  bottomOverlay: { position: 'absolute', bottom: 0, width: '100%', paddingBottom: 40, paddingTop: 120 },
  content: { paddingHorizontal: 24 },
  title: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginBottom: 20, textShadowColor:'rgba(0,0,0,0.5)', textShadowRadius:10 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#fff' },
  username: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  copyBtn: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:12, paddingVertical:6, borderRadius:20 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { color: '#fff', fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  statLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'Poppins_400Regular' },

  downloadBtn: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 18, gap: 12 },
  downloadText: { color: '#000', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  license: { textAlign: 'center', color: '#64748b', fontSize: 10, marginTop: 16 }
});