import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ImageGrid({ results, onDownload }) {
  return (
    <View style={styles.list}>
      {results.map((item) => {
        // 核心修改1: 计算真实比例
        const ratio = item.width / item.height;
        // 判断是否是竖屏图
        const isPortrait = item.height > item.width;

        return (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => onDownload(item)} 
            activeOpacity={0.9} 
            // 核心修改2: 应用真实比例
            style={[styles.card, { aspectRatio: ratio }]}
          >
            <Image source={{ uri: item.urls.regular }} style={styles.image} />
            
            {/* 核心修改3: 右上角添加方向标记 */}
            <View style={styles.orientationBadge}>
                <Ionicons 
                  name={isPortrait ? "phone-portrait-outline" : "laptop-outline"} 
                  size={12} 
                  color="rgba(255,255,255,0.9)" 
                />
            </View>

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
              <View style={styles.userInfo}>
                  <Image source={{ uri: item.user.profile_image.medium }} style={styles.avatar} />
                  <Text style={styles.username} numberOfLines={1}>{item.user.name}</Text>
              </View>
              <View style={styles.btn}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 20, paddingBottom: 20 },
  card: { 
    borderRadius: 20, 
    overflow: 'hidden', 
    backgroundColor: '#e2e8f0', 
    elevation: 4, 
    width: '100%',
    // 注意：aspectRatio 由行内样式控制
  },
  image: { width: '100%', height: '100%' },
  
  // 新增样式
  orientationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 8,
    zIndex: 5
  },

  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#fff' },
  username: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }
});