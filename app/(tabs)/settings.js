import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Linking, 
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { checkVersion } from '../lib/utils/update';
import { 
  getUsername, 
  setUsername, 
  getThemeMode, 
  setThemeMode, 
  getCacheInfo, 
  clearCache,
  getFavorites,
} from '../lib/utils/storage';

// 设置项组件
const SettingItem = ({ icon, title, subtitle, onPress, rightElement, color = '#6366f1' }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement}
  </TouchableOpacity>
);

// 分组标题
const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [username, setUsernameState] = useState('User');
  const [themeMode, setThemeModeState] = useState('system');
  const [cacheInfo, setCacheInfo] = useState({ size: '0', count: 0, lastClean: null });
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // 弹窗状态
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [clearingCache, setClearingCache] = useState(false);

  // 初始化
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [user, theme, cache, favs] = await Promise.all([
      getUsername(),
      getThemeMode(),
      getCacheInfo(),
      getFavorites(),
    ]);
    setUsernameState(user);
    setThemeModeState(theme);
    setCacheInfo(cache);
    setFavoritesCount(favs.length);
  };

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const result = await checkVersion();

      if (result.error) {
        Alert.alert("检查失败", result.error);
        return;
      }

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
    } finally {
      setChecking(false);
    }
  };

  // 编辑用户名
  const handleEditUsername = () => {
    setNewUsername(username);
    setShowUsernameModal(true);
  };

  const saveUsername = async () => {
    if (newUsername.trim()) {
      await setUsername(newUsername.trim());
      setUsernameState(newUsername.trim());
    }
    setShowUsernameModal(false);
  };

  // 切换主题
  const handleThemeChange = async (mode) => {
    await setThemeMode(mode);
    setThemeModeState(mode);
    setShowThemeModal(false);
    // 主题切换通常需要重启才能生效
    Alert.alert(
      "主题已切换",
      "主题设置已保存，部分更改可能需要重启应用才能完全生效。",
      [{ text: "确定" }]
    );
  };

  // 清理缓存
  const handleClearCache = async () => {
    Alert.alert(
      "清理缓存",
      `当前缓存大小: ${cacheInfo.size} KB\n确定要清理吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "清理",
          style: "destructive",
          onPress: async () => {
            setClearingCache(true);
            const success = await clearCache();
            setClearingCache(false);
            if (success) {
              const newCache = await getCacheInfo();
              setCacheInfo(newCache);
              Alert.alert("完成", "缓存已清理");
            } else {
              Alert.alert("错误", "清理失败");
            }
          }
        }
      ]
    );
  };

  // 获取主题显示文本
  const getThemeText = () => {
    const map = { system: '跟随系统', light: '浅色模式', dark: '深色模式' };
    return map[themeMode] || '跟随系统';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部用户信息 */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={64} color="#6366f1" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileVersion}>v{Constants.expoConfig.version}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={handleEditUsername}>
          <Ionicons name="pencil" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 个性化设置 */}
        <SectionHeader title="个性化" />
        <View style={styles.card}>
          <SettingItem
            icon="person"
            title="用户名"
            subtitle={username}
            color="#6366f1"
            onPress={handleEditUsername}
            rightElement={<Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="moon"
            title="主题模式"
            subtitle={getThemeText()}
            color="#8b5cf6"
            onPress={() => setShowThemeModal(true)}
            rightElement={<Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
          />
        </View>

        {/* 数据统计 */}
        <SectionHeader title="数据统计" />
        <View style={styles.card}>
          <SettingItem
            icon="heart"
            title="我的收藏"
            subtitle={`${favoritesCount} 张壁纸`}
            color="#ef4444"
            onPress={() => router.push('/settings/favorites')}
            rightElement={<Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="folder"
            title="缓存大小"
            subtitle={`${cacheInfo.size} KB`}
            color="#f59e0b"
            rightElement={
              clearingCache ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
                  <Text style={styles.clearBtnText}>清理</Text>
                </TouchableOpacity>
              )
            }
          />
          {cacheInfo.lastClean && (
            <>
              <View style={styles.divider} />
              <SettingItem
                icon="time"
                title="上次清理"
                subtitle={cacheInfo.lastClean}
                color="#10b981"
              />
            </>
          )}
        </View>

        {/* 系统设置 */}
        <SectionHeader title="系统" />
        <View style={styles.card}>
          <SettingItem
            icon="refresh-circle"
            title="检查更新"
            subtitle="获取最新版本"
            color="#0ea5e9"
            onPress={handleCheckUpdate}
            rightElement={
              checking ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              )
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="information-circle"
            title="版本信息"
            subtitle={`v${Constants.expoConfig.version}`}
            color="#64748b"
          />
        </View>

        {/* 关于 */}
        <SectionHeader title="关于" />
        <View style={styles.card}>
          <SettingItem
            icon="logo-github"
            title="开源项目"
            subtitle="在 GitHub 上查看源码"
            color="#0f172a"
            onPress={() => Linking.openURL('https://github.com')}
            rightElement={<Ionicons name="open-outline" size={18} color="#cbd5e1" />}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="mail"
            title="意见反馈"
            subtitle="帮助我们改进产品"
            color="#ec4899"
            onPress={() => Alert.alert("反馈", "功能开发中...")}
            rightElement={<Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
          />
        </View>

        {/* 代理信息 */}
        <Text style={styles.proxyText}>🚀 文件加速由 https://ghfast.top 提供</Text>
        <Text style={styles.footerText}>forMe App © 2025</Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 用户名编辑弹窗 */}
      <Modal
        visible={showUsernameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改用户名</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="输入你的名字"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowUsernameModal(false)}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveUsername}
              >
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 主题选择弹窗 */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择主题</Text>
            
            {[
              { id: 'system', name: '跟随系统', icon: 'phone-portrait', desc: '根据系统设置自动切换' },
              { id: 'light', name: '浅色模式', icon: 'sunny', desc: '始终使用浅色主题' },
              { id: 'dark', name: '深色模式', icon: 'moon', desc: '始终使用深色主题' },
            ].map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  themeMode === theme.id && styles.themeOptionActive
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <View style={styles.themeIconContainer}>
                  <Ionicons 
                    name={theme.icon} 
                    size={20} 
                    color={themeMode === theme.id ? '#6366f1' : '#64748b'} 
                  />
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[
                    styles.themeName,
                    themeMode === theme.id && styles.themeNameActive
                  ]}>
                    {theme.name}
                  </Text>
                  <Text style={styles.themeDesc}>{theme.desc}</Text>
                </View>
                {themeMode === theme.id && (
                  <Ionicons name="checkmark" size={20} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.closeBtn, { marginTop: 16 }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.closeBtnText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  // 头部
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  profileVersion: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 内容
  scrollContent: { 
    paddingHorizontal: 20 
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 64,
  },
  clearBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  // 底部
  proxyText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 20,
  },
  footerText: { 
    textAlign: 'center', 
    color: '#94a3b8', 
    fontSize: 12, 
    marginTop: 8 
  },
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#64748b',
    fontWeight: '600',
  },
  // 主题选项
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeOptionActive: {
    backgroundColor: '#e0e7ff',
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  themeNameActive: {
    color: '#6366f1',
  },
  themeDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});
