import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';

// ⚠️ 把这里换成你的 GitHub 用户名和仓库名
const GITHUB_USER = "leoenchanted"; 
const GITHUB_REPO = "forMe"; 

// 获取最新版本信息
const getLatestRelease = async () => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Check update failed:", error);
    return null;
  }
};

// 比较版本号 (v1.1.1 vs 1.1.0)
const isNewer = (latestVer, currentVer) => {
  // 去掉 v 前缀
  const cleanLatest = latestVer.replace('v', '');
  // 简单的字符串比较，或者拆分成数字比较
  return cleanLatest !== currentVer; 
  // 注意：这里用简单的“不相等”做演示。
  // 严谨的做法是用 semver 库比较，但只要你保证版本号一直是增加的，这样也行。
};

export const checkAndUpdate = async () => {
  if (Platform.OS !== 'android') {
    Alert.alert("提示", "iOS暂不支持应用内更新");
    return;
  }

  // 1. 获取当前版本
  const currentVersion = Application.nativeApplicationVersion; // 例如 "1.1.1"
  
  Alert.alert("检查更新", "正在连接 GitHub...");

  // 2. 获取远程版本
  const release = await getLatestRelease();
  
  if (!release || !release.tag_name) {
    Alert.alert("错误", "无法获取更新信息");
    return;
  }

  const latestVersion = release.tag_name; // 例如 "v1.2.0"

  // 3. 对比
  if (isNewer(latestVersion, currentVersion)) {
    // 发现新版本
    Alert.alert(
      "发现新版本 " + latestVersion,
      `当前版本: ${currentVersion}\n\n更新内容:\n${release.body}`,
      [
        { text: "取消", style: "cancel" },
        { 
          text: "立即更新", 
          onPress: () => downloadAndInstall(release.assets[0].browser_download_url) 
        }
      ]
    );
  } else {
    Alert.alert("已是最新", `当前版本 ${currentVersion} 已经是最新版。`);
  }
};

// 下载并安装
const downloadAndInstall = async (url) => {
  try {
    // 设置下载路径
    const fileUri = FileSystem.documentDirectory + 'update.apk';
    
    // 下载回调 (简单显示进度，这里用 Alert 不太好，实际可以用 Toast)
    // Alert.alert("下载中", "请稍候，正在后台下载...");

    const downloadRes = await FileSystem.downloadAsync(url, fileUri);

    // 下载完成，开始安装
    if (downloadRes.status === 200) {
      installAPK(downloadRes.uri);
    } else {
      Alert.alert("错误", "下载失败");
    }
  } catch (e) {
    console.error(e);
    Alert.alert("错误", "更新流程出错");
  }
};

// 唤起安卓安装器
const installAPK = async (uri) => {
  try {
    // 需要把 file:// 转换成 content:// 才能给安装器用
    const contentUri = await FileSystem.getContentUriAsync(uri);
    
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });
  } catch (e) {
    console.error(e);
    Alert.alert("安装失败", "无法唤起安装器");
  }
};