// src/screens/UniversalToolScreen.js
import React, { useRef } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Clipboard from '@react-native-clipboard/clipboard';

export default function UniversalToolScreen({ route }) {
  const { tool } = route.params;
  const viewShotRef = useRef(null);
  const webViewRef = useRef(null); // 👈 新增 ref

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'haptic':
          const style = Haptics.ImpactFeedbackStyle[data.payload?.style] || Haptics.ImpactFeedbackStyle.medium;
          Haptics.impactAsync(style);
          break;

        case 'copy':
          await Clipboard.setString(data.payload);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.success);
          break;

        case 'prepareCapture': // 👈 处理 prepareCapture
          // 1. 注入 JS 隐藏 UI
          webViewRef.current?.injectJavaScript(`
            setCaptureMode(true);
            true;
          `);

          // 2. 延迟截图
          setTimeout(async () => {
            try {
              const { status } = await MediaLibrary.requestPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('权限被拒绝', '请在设置中允许访问相册以保存图片。');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.warning);
                // 恢复 UI
                webViewRef.current?.injectJavaScript(`setCaptureMode(false); true;`);
                return;
              }

              if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();

                // 3. 立即恢复 UI
                webViewRef.current?.injectJavaScript(`setCaptureMode(false); true;`);

                if (uri) {
                  await MediaLibrary.createAssetAsync(uri);
                  Alert.alert('✅ 保存成功', '图片已保存到您的相册！');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.success);
                } else {
                  throw new Error('Capture returned empty URI');
                }
              }
            } catch (err) {
              console.error('Capture error:', err);
              Alert.alert('❌ 保存失败', '请稍后重试。');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.error);
              // 确保 UI 恢复
              webViewRef.current?.injectJavaScript(`setCaptureMode(false); true;`);
            }
          }, 100);
          break;

        default:
          console.log('Unhandled message:', data);
      }
    } catch (e) {
      console.warn('Invalid message format:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.viewShot}
      >
        <WebView
          ref={webViewRef} // 👈 绑定 ref
          source={{ html: tool.sourceHtml }}
          onMessage={handleMessage}
          style={styles.webview}
          originWhitelist={['*']}
          scalesPageToFit={false}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewShot: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
