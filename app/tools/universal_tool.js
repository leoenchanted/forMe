import React, { useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing"; // 虽然不直接用，但留着可能有用
import { useLocalSearchParams, useRouter } from "expo-router";

export default function UniversalToolScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { toolTitle, sourceHtml, sourceUrl } = params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  console.log(router);
  // 新增 Native 状态用于数据展示和保存
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState(null);
  const [exportColors, setExportColors] = useState([]); // 存储四个点的颜色数据

  // 保存图片的核心函数
  const saveWallpaper = useCallback(async () => {
    if (!exportDataUrl) return;

    // 1. 请求权限
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("权限不足", "需要相册写入权限才能保存图片。", [
        { text: "设置", onPress: () => Linking.openSettings() },
        { text: "取消", style: "cancel" },
      ]);
      return;
    }

    // 2. 将 DataURL (Base64) 写入临时文件
    const base64 = exportDataUrl.split(",")[1];
    const filename =
      FileSystem.cacheDirectory + `mesh_gradient_${Date.now()}.png`;

    try {
      await FileSystem.writeAsStringAsync(filename, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. 保存到相册
      const asset = await MediaLibrary.createAssetAsync(filename);
      await MediaLibrary.createAlbumAsync("Expo Tools", asset, false);

      setIsExportModalVisible(false); // 关闭弹窗
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("保存成功", "壁纸已保存到相册中！", [{ text: "好的" }]);
    } catch (e) {
      console.error("Save Error:", e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("保存失败", "无法将图片保存到您的设备。");
    }
  }, [exportDataUrl]);

  // 处理来自 WebView 网页的消息 (Bridge)
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`[Tool] Action:`, data.type);

      switch (data.type) {
        // 震动反馈 (轻/中/重)
        case "haptic":
          const style =
            data.style === "heavy"
              ? Haptics.ImpactFeedbackStyle.Heavy
              : data.style === "medium"
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light;
          await Haptics.impactAsync(style);
          break;

        // 复制文字到剪贴板 (如果HTML需要 Native 协助)
        case "copy":
          await Clipboard.setStringAsync(data.payload);
          break;

        // 关闭页面
        case "close":
          router.back();
          break;

        // 分享文本
        case "share":
          await Share.share({ message: data.payload });
          break;

        // 新增：处理 Web 端发来的 DataURL 和颜色数据
        case "exportAndSave":
          setExportDataUrl(data.payload.dataUrl);
          setExportColors(data.payload.colors);
          setIsExportModalVisible(true); // 弹出 Native 导出弹窗
          // 确保在 iOS 上弹窗时，WebView 不再是焦点
          webViewRef.current.injectJavaScript("document.activeElement.blur();");
          break;
      }
    } catch (e) {
      console.error("Message Error:", e);
    }
  };

  // 构造 Webview 内容源
  const source = sourceUrl ? { uri: sourceUrl } : { html: sourceHtml };

  return (
    <View style={styles.container}>
      {/* 顶部简单的导航栏 */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Ionicons
          name="close"
          size={24}
          color="#fff"
          onPress={() => router.back()}
        />
        <View style={styles.titleContainer}>
          {/* 标题，可以显示 toolTitle */}
          {/* <Text style={styles.titleText}>{toolTitle}</Text> */}
        </View>
        <View style={{ width: 24 }} />
      </SafeAreaView>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        style={{ flex: 1, backgroundColor: "#000" }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        onLoadEnd={() => setLoading(false)}
      />

      {/* Native 导出数据弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isExportModalVisible}
        onRequestClose={() => setIsExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>渐变参数与导出</Text>

            {/* 颜色数据列表 */}
            <ScrollView style={styles.dataScrollView}>
              {exportColors.map((color, index) => (
                <View key={index} style={styles.colorRow}>
                  <View
                    style={[styles.colorChip, { backgroundColor: color.hex }]}
                  />
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorLabel}>点 {index + 1} HEX:</Text>
                    <Text style={styles.colorValue}>{color.hex}</Text>
                  </View>
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorLabel}>RGB:</Text>
                    <Text style={styles.colorValue}>
                      R:{color.r} G:{color.g} B:{color.b}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#f59e0b"
                />
                高分辨率壁纸已生成，点击下方按钮保存到您的相册。
              </Text>
            </View>

            {/* 保存按钮 */}
            <TouchableOpacity
              style={styles.saveActionBtn}
              onPress={saveWallpaper}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={20} color="white" />
              <Text style={styles.saveActionText}>保存高分辨率壁纸</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={() => setIsExportModalVisible(false)}
            >
              <Text style={styles.closeActionText}>取消/关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#111",
  },
  titleContainer: { flex: 1, alignItems: "center" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 99,
  },

  // Modal 样式
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#2c2c2e",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  dataScrollView: { maxHeight: 200, width: "100%", marginBottom: 15 },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  colorChip: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  colorInfo: { flex: 1, marginRight: 10 },
  colorLabel: { color: "#8e8e93", fontSize: 10, marginBottom: 2 },
  colorValue: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  tipBox: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  tipText: { color: "#f59e0b", fontSize: 13, textAlign: "center" },

  saveActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007aff",
    padding: 15,
    borderRadius: 14,
    width: "100%",
    marginBottom: 10,
  },
  saveActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeActionBtn: { padding: 10 },
  closeActionText: { color: "#8e8e93", fontSize: 16, fontWeight: "600" },
});
