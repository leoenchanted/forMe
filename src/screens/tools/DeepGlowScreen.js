import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { DeepGlowHTML } from '../../../assets/deepglow.html.js'

export default function DeepGlowScreen({ navigation }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 1. 选择图片并传给 WebView
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      base64: true, // 关键：获取 base64
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      // 发送给 WebView
      const script = `loadImage('${base64Img}'); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // 2. 触发 WebView 的保存逻辑
  const triggerSave = () => {
    setLoading(true);
    // 通知 WebView 渲染并返回图片
    webViewRef.current.postMessage(JSON.stringify({ type: 'saveImage' }));
  };

  // 3. 处理 WebView 发回来的消息
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'saveResult') {
        // data.payload 是 base64 字符串
        await saveToGallery(data.payload);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // 4. 保存 Base64 到相册
  const saveToGallery = async (base64Data) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied");
        return;
      }

      // Base64 需要先写入文件
      const fileName = FileSystem.documentDirectory + `deepglow_${Date.now()}.jpg`;
      const base64Code = base64Data.split('data:image/jpeg;base64,')[1];
      
      await FileSystem.writeAsStringAsync(fileName, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileName);
      Alert.alert("Saved!", "Image saved to gallery.");
    } catch (e) {
      Alert.alert("Error", "Failed to save image.");
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
      />

      {/* 底部控制栏 */}
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