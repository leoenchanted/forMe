const { withGradleProperties } = require('@expo/config-plugins');

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

// 1. 定义内存优化插件 (解决 GitHub Actions OOM 问题)
const withMemoryOptimization = (config) => {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      item => !['org.gradle.jvmargs', 'org.gradle.parallel', 'org.gradle.daemon'].includes(item.key)
    );
    config.modResults.push(
      { type: 'property', key: 'org.gradle.jvmargs', value: '-Xmx3072m -XX:MaxMetaspaceSize=1024m' },
      { type: 'property', key: 'org.gradle.parallel', value: 'false' },
      { type: 'property', key: 'org.gradle.daemon', value: 'false' }
    );
    return config;
  });
};

export default ({config}) => {
  const updatedConfig = {
    ...config,
    name: IS_DEV ? "forme (Dev)" : "forMe", // 开发版名字不一样
    slug: "forMe",
    version: "1.1.7",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      "supportsTablet": true,
      "bundleIdentifier": IS_DEV ? "com.leoenchanted.forMe.dev" : "com.leoenchanted.forMe"
    },
    android: {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#ffffff"
      },
      // 核心修改：如果是开发版，包名后面加 .dev，这样就能共存了！
      "package": IS_DEV ? "com.leoenchanted.forMe.dev" : "com.leoenchanted.forMe",
      "permissions":["REQUEST_INSTALL_PACKAGES"]
    },
    web: {
      "favicon": "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow forme to access your photos to edit them."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow forme to save wallpapers to your photos.",
          "savePhotosPermission": "Allow forme to save wallpapers to your photos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ],
        // 1. 定义运行时版本 (告诉系统这个更新包兼容哪个版本的 App)
    runtimeVersion: {
      policy: "appVersion" 
    },
    
    // 2. 定义更新服务器地址
    updates: {
      url: "https://u.expo.dev/e3327d5b-e82a-4111-950f-affc5497935c" 
    },

    // 👆👆👆 新增结束 👆👆👆
    extra: {
      eas: {
        projectId: "e3327d5b-e82a-4111-950f-affc5497935c" // ⚠️ 如果你之前删了这一行，这里不填也没事，EAS会自动识别
      }
    }
  }

  return withMemoryOptimization(updatedConfig);
};
