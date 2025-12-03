const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

export default {
  expo: {
    name: IS_DEV ? "forme (Dev)" : "forMe", // 开发版名字不一样
    slug: "forMe",
    version: "1.1.1",
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
      "package": IS_DEV ? "com.leoenchanted.forMe.dev" : "com.leoenchanted.forMe"
    },
    web: {
      "favicon": "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow forme to save wallpapers to your photos.",
          "savePhotosPermission": "Allow forme to save wallpapers to your photos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "e3327d5b-e82a-4111-950f-affc5497935c" // ⚠️ 如果你之前删了这一行，这里不填也没事，EAS会自动识别
      }
    }
  }
};