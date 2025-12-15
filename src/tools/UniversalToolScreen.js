// src/screens/UniversalToolScreen.js
import React, { useRef } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';

export default function UniversalToolScreen({ route }) {
  const { tool } = route.params;
  const viewShotRef = useRef(null);
  const webViewRef = useRef(null);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'haptic':
          const style = Haptics.ImpactFeedbackStyle[data.payload?.style] || Haptics.ImpactFeedbackStyle.medium;
          Haptics.impactAsync(style);
          break;

        case 'requestScreenshot': {
          const { action } = data.payload || {};

          // 隐藏 UI（如果 HTML 实现了 setCaptureMode）
          webViewRef.current?.injectJavaScript(`
            typeof setCaptureMode === 'function' && setCaptureMode(true);
            true;
          `);

          setTimeout(async () => {
            let uri = null;
            try {
              if (viewShotRef.current) {
                uri = await viewShotRef.current.capture();
              }
            } catch (err) {
              console.error('Capture failed:', err);
            }

            // 恢复 UI
            webViewRef.current?.injectJavaScript(`
              typeof setCaptureMode === 'function' && setCaptureMode(false);
              true;
            `);

            // 如果指定了 action，则执行（目前仅支持 saveToAlbum）
            if (uri && action === 'saveToAlbum') {
              try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                  await MediaLibrary.createAssetAsync(uri);
                  Alert.alert('✅ 保存成功', '图片已保存到您的相册！');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.success);
                } else {
                  Alert.alert('权限被拒绝', '请在设置中允许访问相册。');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.warning);
                }
              } catch (e) {
                console.error('Save to album error:', e);
                Alert.alert('❌ 保存失败', '请稍后重试。');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.error);
              }
            }

            // 未来可扩展：通过 callback 回传 uri 给 JS
          }, 100);
          break;
        }

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
          ref={webViewRef}
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
