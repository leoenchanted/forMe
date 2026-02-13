import { Platform } from 'react-native';
import * as Application from 'expo-application';

// ⚠️ 配置
const GITHUB_USER = "leoenchanted"; 
const GITHUB_REPO = "forMe"; 
const DOWNLOAD_PROXY = 'https://ghfast.top/'; // 国内加速

// 获取最新 Release 数据
const getLatestRelease = async () => {
  try {
    // 增加一个随机数防止缓存
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest?t=${Date.now()}`);
    if (response.status !== 200) return null;
    return await response.json();
  } catch (error) {
    console.error("Check update failed:", error);
    return null;
  }
};

// 版本号比较 (v1.1.5 > 1.1.0)
const isNewer = (latestVer, currentVer) => {
  if (!latestVer || !currentVer) return false;
  const v1 = latestVer.replace(/^v/, '').split('.').map(Number);
  const v2 = currentVer.replace(/^v/, '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return false;
};

/**
 * 检查更新的核心函数
 * 返回对象: { hasUpdate: boolean, latestVersion: string, releaseNotes: string, downloadUrl: string, error: string }
 */
export const checkVersion = async () => {
  if (Platform.OS !== 'android') {
    return { error: "iOS 暂不支持检查更新" };
  }

  const currentVersion = Application.nativeApplicationVersion; 
  const release = await getLatestRelease();

  if (!release || !release.tag_name) {
    return { error: "无法连接到更新服务器" };
  }

  const latestVersion = release.tag_name;
  const hasUpdate = isNewer(latestVersion, currentVersion);

  // 寻找 APK 链接
  let downloadUrl = null;
  if (release.assets && release.assets.length > 0) {
    const asset = release.assets.find(a => a.name.endsWith('.apk'));
    if (asset) {
      // 🔥 拼接加速链接
      downloadUrl = DOWNLOAD_PROXY + asset.browser_download_url;
    }
  }

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    releaseNotes: release.body,
    downloadUrl,
    error: null
  };
};