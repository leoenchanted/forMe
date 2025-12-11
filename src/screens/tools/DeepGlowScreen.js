import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { DeepGlowHTML } from '../../../assets/deepglow.html.js';

export default function DeepGlowScreen({ navigation }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 1. 选择图片 (增强版)
  const pickImage = async () => {
    try {
      console.log("正在尝试打开相册...");
      
      // A. 显式请求权限 (防止系统静默拒绝)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("相册权限状态:", status);
      
      if (status !== 'granted') {
        Alert.alert("需要权限", "请去设置里允许应用访问相册，否则无法选图。");
        return;
      }

      // B. 打开相册
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // 确保用的是新版写法
        base64: true, 
        quality: 0.8,
      });

      console.log("选图结果:", result.canceled ? "取消" : "成功");

      if (!result.canceled && result.assets[0].base64) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // 发送给 WebView
        const script = `loadImage('${base64Img}'); true;`;
        webViewRef.current.injectJavaScript(script);
      }
    } catch (e) {
      // C. 捕捉错误并弹窗
      console.error("选图报错:", e);
      Alert.alert("错误", "打开相册失败: " + e.message);
    }
  };

  const triggerSave = () => {
    setLoading(true);
    webViewRef.current.postMessage(JSON.stringify({ type: 'saveImage' }));
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'saveResult') {
        await saveToGallery(data.payload);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const saveToGallery = async (base64Data) => {
    try {
      // 这里的权限请求通常在 app.config.js 配置好 plugins 后，配合 saveToLibraryAsync 会自动处理
      // 但为了保险，可以保留这个检查
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied");
        return;
      }

      const fileName = FileSystem.documentDirectory + `deepglow_${Date.now()}.jpg`;
      const base64Code = base64Data.split('data:image/jpeg;base64,')[1];
      
      await FileSystem.writeAsStringAsync(fileName, base64Code, {
        encoding: 'base64',
      });

      await MediaLibrary.saveToLibraryAsync(fileName);
      Alert.alert("✅ Saved!", "Image saved to gallery.");
    } catch (e) {
      Alert.alert("Error", "Failed to save image: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: DeepGlowHTML }}
        style={{ flex: 1, backgroundColor: '#000' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // 关键：防止 Android WebView 崩溃或无法加载本地内容
        mixedContentMode="always"
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickImage} style={[styles.btn, styles.mainBtn]}>
          <Ionicons name="image" size={20} color="#000" />
          <Text style={styles.btnText}>Open Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={triggerSave} style={[styles.btn, styles.saveBtn]}>
          {loading ? <ActivityIndicator color="#fff"/> : <Ionicons name="download" size={24} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  toolbar: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' },
  btn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  mainBtn: { width: 140, backgroundColor: '#fff', flexDirection: 'row', gap: 8 },
  saveBtn: { backgroundColor: '#8b5cf6' },
  btnText: { fontWeight: 'bold' }
});
