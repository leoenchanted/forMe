import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getFavorites } from '../utils/storage';
import ImageGrid from '../components/ImageGrid';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favs, setFavs] = useState([]);

  // 每次进入页面时重新读取
  useFocusEffect(
    React.useCallback(() => {
      loadFavs();
    }, [])
  );

  const loadFavs = async () => {
    const data = await getFavorites();
    setFavs(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>My Collection</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {favs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-dislike-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No favorites yet.</Text>
          </View>
        ) : (
          <ImageGrid results={favs} onDownload={(photo) => router.push(`/vibewall/detail/${encodeURIComponent(JSON.stringify(photo))}`)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#1e293b' },
  content: { padding: 20 },
  empty: { marginTop: 100, alignItems: 'center', gap: 10 },
  emptyText: { color: '#94a3b8', fontFamily: 'Poppins_400Regular' }
});