import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function UniversalToolScreen({ route, navigation }) {
  // 1. 接收参数：网页标题、HTML代码、或者在线URL
  const { toolTitle, sourceHtml, sourceUrl } = route.params; 
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // 2. 处理来自 WebView 网页的消息 (Bridge)
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`[Tool] Action:`, data.type);

      switch (data.type) {
        // 震动反馈 (轻/中/重)
        case 'haptic':
          const style = data.style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : 
                        data.style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                        Haptics.ImpactFeedbackStyle.Light;
          await Haptics.impactAsync(style);
          break;

        // 复制文字到剪贴板
        case 'copy':
          await Clipboard.setStringAsync(data.payload);
          // 可以选择弹个 Toast，或者让网页自己处理反馈
          break;

        // 关闭页面
        case 'close':
          navigation.goBack();
          break;
          
        // 分享文本
        case 'share':
          await Share.share({ message: data.payload });
          break;
      }
    } catch (e) {
      console.error("Message Error:", e);
    }
  };

  // 3. 构造 Webview 内容源
  const source = sourceUrl ? { uri: sourceUrl } : { html: sourceHtml };

  return (
    <View style={styles.container}>
      {/* 顶部简单的导航栏 */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Ionicons name="close" size={24} color="#fff" onPress={() => navigation.goBack()} />
        <View style={styles.titleContainer}>
            {/* 这里显示工具标题 */}
        </View>
        <View style={{width: 24}} /> 
      </SafeAreaView>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={source}
        style={{ flex: 1, backgroundColor: '#000' }} // 默认黑底
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        onLoadEnd={() => setLoading(false)}
      />
      
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#111' },
  titleContainer: { flex: 1, alignItems: 'center' },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 99 }
});