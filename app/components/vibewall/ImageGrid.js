import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ImageGrid({ results, onDownload }) {
  // 安全检查 1：如果列表是空的，啥也不渲染
  if (!results || !Array.isArray(results)) return null;

  return (
    <View style={styles.list}>
      {results.map((item, index) => {
        // 安全检查 2：如果这条数据坏了（没有 urls），直接跳过，不要崩
        if (!item || !item.urls) return null;

        // 计算比例，缺省值为 1
        const width = item.width || 100;
        const height = item.height || 100;
        const ratio = width / height;
        const isPortrait = height > width;

        return (
          <TouchableOpacity 
            key={item.id || index} // 兜底 key
            onPress={() => onDownload && onDownload(item)} 
            activeOpacity={0.9} 
            style={[styles.card, { aspectRatio: ratio }]}
          >
            {/* 🔥 核心修复：使用 ?.urls?.regular 绝对安全写法 */}
            <Image 
                source={{ uri: item.urls?.regular }} 
                style={styles.image} 
                resizeMode="cover"
            />
            
            <View style={styles.orientationBadge}>
                <Ionicons 
                  name={isPortrait ? "phone-portrait-outline" : "laptop-outline"} 
                  size={12} 
                  color="rgba(255,255,255,0.9)" 
                />
            </View>

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
              <View style={styles.userInfo}>
                  {/* 用户头像也加个安全检查 */}
                  <Image source={{ uri: item.user?.profile_image?.medium }} style={styles.avatar} />
                  <Text style={styles.username} numberOfLines={1}>{item.user?.name || 'Unknown'}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16, paddingBottom: 20 },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#e2e8f0', elevation: 4, width: '100%' },
  image: { width: '100%', height: '100%' },
  orientationBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', padding: 6, borderRadius: 8, zIndex: 5 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#fff', backgroundColor:'#ccc' },
  username: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
});