import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ImageGrid({ results, onDownload }) {
  return (
    <View style={styles.list}>
      {results.map((item) => (
        <TouchableOpacity key={item.id} onPress={() => onDownload(item)} activeOpacity={0.9} style={styles.card}>
          <Image source={{ uri: item.urls.regular }} style={styles.image} />
          
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
            <View style={styles.userInfo}>
                <Image source={{ uri: item.user.profile_image.medium }} style={styles.avatar} />
                <Text style={styles.username}>{item.user.name}</Text>
            </View>
            <View style={styles.btn}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 20, paddingBottom: 20 },
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0', elevation: 4, aspectRatio: 3/4, width: '100%' }, // aspectRatio 3/4 保持竖屏比例
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#fff' },
  username: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }
});