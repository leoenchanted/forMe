import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator'; // 引入缩放库
import { Ionicons } from '@expo/vector-icons';
import { DeepGlowHTML } from '../../../assets/deepglow.html.js';

export default function DeepGlowScreen({ navigation }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 1. 处理图片尺寸，防止 WebGL 黑屏
  const processImage = async (uri) => {
    const MAX_SIZE = 4096; // 大多数手机 WebGL 的安全上限
    const info = await ImageManipulator.manipulateAsync(uri, []);
    
    let actions = [];
    if (info.width > MAX_SIZE || info.height > MAX_SIZE) {
      // 等比例缩放
      const isWidthLarger = info.width > info.height;
      actions.push({
        resize: isWidthLarger ? { width: MAX_SIZE } : { height: MAX_SIZE }
      });
    }

    // 转换为 base64
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { format: ImageManipulator.SaveFormat.JPEG, base64: true, compress: 0.9 }
    );
    return `data:image/jpeg;base64,${result.base64}`;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("需要权限", "请允许访问相册以选择图片。");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 建议不在这里编辑，交给 WebGL 处理
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        const base64Img = await processImage(result.assets[0].uri);
        const script = `loadImage('${base64Img}'); true;`;
        webViewRef.current.injectJavaScript(script);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("错误", "打开相册失败: " + e.message);
    }
  };

  const triggerSave = () => {
    setLoading(true);
    // 向 WebView 发送保存指令
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
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("错误", "没有相册保存权限");
        return;
      }

      // 1. 纯净的 Base64 数据
      const base64Code = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // 2. 生成临时文件名
      const filename = `${FileSystem.cacheDirectory}deepglow_${Date.now()}.jpg`;

      // 3. 使用标准 FileSystem API 写入文件
      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. 保存到相册并创建相册资产
      const asset = await MediaLibrary.createAssetAsync(filename);
      // 也可以选择移动到特定相册：await MediaLibrary.createAlbumAsync('DeepGlow', asset, false);

      Alert.alert("✅ 保存成功", "图片已存入系统相册");
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("保存失败", e.message);
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
        mixedContentMode="always"
        // 增加此属性确保大图加载更稳定
        allowFileAccess={true}
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickImage} style={[styles.btn, styles.mainBtn]}>
          <Ionicons name="image" size={20} color="#000" />
          <Text style={styles.btnText}>{loading ? '处理中...' : '选择图片'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={triggerSave} style={[styles.btn, styles.saveBtn]} disabled={loading}>
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