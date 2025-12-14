import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DailyCard({ photo, type, onDownload, width, height }) {
  
  // 🔥 核心修改：当没有 photo 数据时，显示 Loading 转圈
  if (!photo || !photo?.urls?.regular) {
    return (
      <View style={[styles.card, { width, height, marginRight: 16 }, styles.loadingContainer]}>
        {/* 这里显示菊花图，颜色用你主题的紫色 */}
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    ); 
  }

  // 有数据后直接渲染图片，保持原样
  return (
    <View style={[styles.card, { width, height, marginRight: 16 }]}>
      <Image source={{ uri: photo.urls?.regular }} style={styles.cardImg} />
      
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay}>
        <Text style={styles.cardBadge}>{type}</Text>
        <TouchableOpacity onPress={() => onDownload && onDownload(photo)} style={styles.miniDownloadBtn}>
          <Ionicons name="arrow-down" size={12} color="#000" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0', elevation: 5 },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardBadge: { color: '#fff', fontSize: 10, fontFamily: 'Poppins_600SemiBold', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  miniDownloadBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  
  // 新增：专门给 loading 用的样式
  loadingContainer: {
    backgroundColor: '#cbd5e1', // 保持之前的灰色底
    justifyContent: 'center',   // 上下居中
    alignItems: 'center',       // 左右居中
    opacity: 0.8                // 稍微淡一点
  },
});