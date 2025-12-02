import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DailyCard({ photo, type, onDownload, width, height }) {
  return (
    <View style={[styles.card, { width, height, marginRight: 16 }]}>
      {photo ? (
        <>
          <Image source={{ uri: photo.urls.regular }} style={styles.cardImg} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay}>
            <Text style={styles.cardBadge}>{type}</Text>
            <TouchableOpacity onPress={() => onDownload(photo)} style={styles.miniDownloadBtn}>
              <Ionicons name="arrow-down" size={12} color="#000" />
            </TouchableOpacity>
          </LinearGradient>
        </>
      ) : (
        <View style={styles.skeleton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0', elevation: 5 },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardBadge: { color: '#fff', fontSize: 10, fontFamily: 'Poppins_600SemiBold', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  miniDownloadBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  skeleton: { flex: 1, backgroundColor: '#cbd5e1', opacity: 0.5 },
});