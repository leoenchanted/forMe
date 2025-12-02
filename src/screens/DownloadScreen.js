import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../context/DownloadContext';

export default function DownloadScreen({ navigation }) {
  const { downloads } = useDownloads();

  const renderItem = ({ item }) => {
    const progressPercent = Math.round(item.progress * 100) + '%';
    
    let statusColor = '#3b82f6';
    let statusIcon = 'cloud-download-outline';
    // 核心修改：默认显示详细数据
    let statusText = `Downloading ${progressPercent} (${item.written || 0}MB / ${item.total || '?'}MB)`;

    if (item.status === 'saving') {
      statusColor = '#eab308';
      statusText = 'Saving to Gallery...';
    } else if (item.status === 'success') {
      statusColor = '#22c55e';
      statusIcon = 'checkmark-circle';
      // 下载完成后，显示最终文件大小
      statusText = `Saved (${item.total || '?'}MB)`;
    } else if (item.status === 'error') {
      statusColor = '#ef4444';
      statusIcon = 'alert-circle';
      statusText = item.errorMsg || 'Failed';
    }

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
        <View style={styles.info}>
          <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
          
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: progressPercent, backgroundColor: statusColor }]} />
          </View>
          
          <View style={styles.statusRow}>
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Downloads</Text>
        <View style={{width: 40}} />
      </View>

      <FlatList
        data={downloads}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No downloads yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#1e293b' },
  listContent: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#e2e8f0' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  fileName: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#334155', marginBottom: 6 },
  progressTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressBar: { height: '100%', borderRadius: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
  empty: { marginTop: 100, alignItems: 'center', gap: 10 },
  emptyText: { color: '#94a3b8', fontFamily: 'Poppins_400Regular' }
});