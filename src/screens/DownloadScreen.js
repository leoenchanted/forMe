import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../context/DownloadContext';

export default function DownloadScreen({ navigation }) {
  const { downloads, pauseDownload, resumeDownload, deleteTask } = useDownloads();

  const handlePress = (item) => {
    if (item.status === 'downloading') {
      pauseDownload(item.id);
    } else if (item.status === 'paused' || item.status === 'error') {
      resumeDownload(item.id);
    } else if (item.status === 'success') {
      navigation.navigate('Detail', { photo: item.originalPhoto });
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
        "Delete Download", 
        "Remove this record and file?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteTask(item.id) }
        ]
    );
  };

  const renderItem = ({ item }) => {
    const progressPercent = Math.round(item.progress * 100) + '%';
    
    let statusColor = '#3b82f6';
    let statusIcon = 'cloud-download-outline';
    let statusText = `Downloading... ${item.written}/${item.total}MB`;
    let isFinished = false;

    if (item.status === 'paused') {
      statusColor = '#f59e0b';
      statusIcon = 'pause-circle';
      statusText = `Paused (${progressPercent})`;
    } else if (item.status === 'success') {
      statusColor = '#22c55e';
      statusIcon = 'checkmark-circle';
      statusText = `Saved (${item.total}MB)`;
      isFinished = true;
    } else if (item.status === 'error') {
      statusColor = '#ef4444';
      statusIcon = 'alert-circle';
      statusText = item.errorMsg || 'Failed';
    } else if (item.status === 'saving') {
        statusColor = '#eab308';
        statusText = 'Writing to Gallery...';
    }

    return (
      <View style={styles.card}>
        {/* 点击区域：控制暂停/继续/查看 */}
        <TouchableOpacity 
            style={styles.mainClickArea} 
            activeOpacity={0.7}
            onPress={() => handlePress(item)}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            
            <View style={styles.info}>
                <Text style={styles.fileName} numberOfLines={1}>
                    {item.originalPhoto?.description || "Wallpaper"}
                </Text>
                
                {/* 进度条：只在非完成状态显示 */}
                {!isFinished && (
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: progressPercent, backgroundColor: statusColor }]} />
                    </View>
                )}
                
                <View style={styles.statusRow}>
                    <Ionicons name={statusIcon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>
        </TouchableOpacity>

        {/* 侧边按钮栏 */}
        <View style={styles.actions}>
            {/* 状态指示器/操作按钮 */}
            {!isFinished && (
                <TouchableOpacity onPress={() => handlePress(item)} style={styles.actionBtn}>
                    <Ionicons 
                        name={item.status === 'downloading' ? "pause" : "play"} 
                        size={20} 
                        color={statusColor} 
                    />
                </TouchableOpacity>
            )}

            {/* 删除按钮 */}
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
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
  
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  
  mainClickArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#e2e8f0' },
  info: { flex: 1, marginLeft: 12, marginRight: 8 },
  fileName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#334155', marginBottom: 4 },
  
  progressTrack: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressBar: { height: '100%', borderRadius: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold' },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 8 }, // 增加点击热区
  
  empty: { marginTop: 100, alignItems: 'center', gap: 10 },
  emptyText: { color: '#94a3b8', fontFamily: 'Poppins_400Regular' }
});