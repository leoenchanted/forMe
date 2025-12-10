import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // 还是可以用这个显示本地版本，或者用 Application

// 👇 引入刚才重构的工具
import { checkVersion } from '../../utils/update';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      // 1. 调用工具函数获取结果
      const result = await checkVersion();

      if (result.error) {
        Alert.alert("检查失败", result.error);
        return;
      }

      // 2. 根据结果弹窗
      if (result.hasUpdate) {
        if (result.downloadUrl) {
          Alert.alert(
            "发现新版本! 🎉",
            `最新版本: ${result.latestVersion}\n\n更新内容:\n${result.releaseNotes || '修复了一些已知问题。'}`,
            [
              { text: "下次再说", style: "cancel" },
              { 
                text: "立即更新", 
                onPress: () => {
                  // 3. 跳转浏览器下载 (这是最稳的)
                  Linking.openURL(result.downloadUrl).catch(() => 
                    Alert.alert("错误", "无法打开浏览器，请手动去 GitHub 下载")
                  );
                }
              }
            ]
          );
        } else {
          Alert.alert("提示", "发现新版本，但安装包还没准备好，请稍后再试。");
        }
      } else {
        Alert.alert("已是最新", `当前版本 (v${result.currentVersion}) 已经是最新版。`);
      }

    } catch (e) {
      Alert.alert("错误", "检查更新时发生未知错误");
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={{flexDirection:'row', alignItems:'center', gap: 10}}>
                    <Ionicons name="information-circle-outline" size={24} color="#334155" />
                    <Text style={styles.label}>Version</Text>
                </View>
                <Text style={styles.value}>v{Constants.expoConfig.version}</Text>
            </View>
            
            <View style={styles.divider} />

            <TouchableOpacity 
                style={styles.btn} 
                onPress={handleCheckUpdate} // 绑定点击事件
                disabled={checking}
                activeOpacity={0.8}
            >
                {checking ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Check for Updates</Text>
                )}
            </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>forMe App © 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', padding: 20 },
  scroll: { paddingHorizontal: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 16, color: '#334155', fontWeight: '500' },
  value: { fontSize: 16, color: '#64748b', fontFamily: 'monospace' },
  
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },

  btn: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  footerText: { textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginTop: 20 }
});