import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ImageCard({ photo, onPress, onToggleFavorite, isFavorite, index }) {
  // 根据索引决定卡片高度，创建瀑布流效果
  const heights = [200, 280, 240, 320, 180, 260];
  const cardHeight = heights[index % heights.length];
  
  if (!photo || !photo.urls) {
    return (
      <View style={[styles.card, { height: cardHeight }]}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { height: cardHeight }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: photo.urls.small }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* 渐变遮罩 */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        {/* 收藏按钮 */}
        <TouchableOpacity 
          style={styles.favBtn}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(photo);
          }}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={18} 
            color={isFavorite ? '#ef4444' : '#fff'} 
          />
        </TouchableOpacity>
        
        {/* 底部信息 */}
        <View style={styles.info}>
          {photo.user && (
            <View style={styles.userInfo}>
              {photo.user.profile_image?.small && (
                <Image 
                  source={{ uri: photo.user.profile_image.small }}
                  style={styles.avatar}
                />
              )}
              <Text style={styles.username} numberOfLines={1}>
                {photo.user.name}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#e2e8f0',
  },
  skeleton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginTop: 'auto',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  username: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});
