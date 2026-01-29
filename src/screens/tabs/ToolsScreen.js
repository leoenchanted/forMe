import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ALL_TOOLS } from "../../tools/registry";

export default function ToolsScreen() {
  const router = useRouter();

  const handlePress = (tool) => {
    if (tool.type === "native") {
      // 如果是复杂原生工具，直接跳转路由
      router.push(`/tools/${tool.routeName.toLowerCase()}`);
    } else {
      // 如果是通用网页工具，跳转万能容器，并把参数传过去
      router.push({
        pathname: "/tools/universal_tool",
        params: {
          toolTitle: tool.title,
          sourceHtml: tool.sourceHtml,
          sourceUrl: tool.sourceUrl,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tools</Text>
      <FlatList
        data={ALL_TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  desc: { fontSize: 12, color: "#64748b" },
});
