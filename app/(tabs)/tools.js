import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ALL_TOOLS } from "../lib/tools/registry";

// 工具分类
const TOOL_CATEGORIES = {
  design: { name: '设计工具', icon: 'color-palette', color: '#8b5cf6' },
  utility: { name: '实用工具', icon: 'construct', color: '#0ea5e9' },
  dev: { name: '开发工具', icon: 'code-slash', color: '#10b981' },
  other: { name: '其他工具', icon: 'apps', color: '#f59e0b' },
};

// 给工具添加分类
const getToolCategory = (toolId) => {
  const categoryMap = {
    deepglow: 'design',
    hsl_tools: 'design',
    mesh_gradient: 'design',
  };
  return categoryMap[toolId] || 'other';
};

export default function ToolsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 处理工具数据，添加分类
  const toolsWithCategory = useMemo(() => {
    return ALL_TOOLS.map(tool => ({
      ...tool,
      category: getToolCategory(tool.id),
    }));
  }, []);

  // 过滤工具
  const filteredTools = useMemo(() => {
    let tools = toolsWithCategory;
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tools = tools.filter(tool => 
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }
    
    // 分类过滤
    if (selectedCategory !== 'all') {
      tools = tools.filter(tool => tool.category === selectedCategory);
    }
    
    return tools;
  }, [toolsWithCategory, searchQuery, selectedCategory]);

  // 按分类分组
  const groupedTools = useMemo(() => {
    const groups = {};
    filteredTools.forEach(tool => {
      const cat = tool.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const handlePress = (tool) => {
    if (tool.type === "native") {
      router.push(`/tools/${tool.routeName.toLowerCase()}`);
    } else {
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
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>工具箱</Text>
        <Text style={styles.headerSubtitle}>实用小工具合集</Text>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索工具..."
            placeholderTextColor="#cbd5e1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Ionicons 
            name="apps" 
            size={14} 
            color={selectedCategory === 'all' ? '#fff' : '#64748b'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === 'all' && styles.categoryTextActive
          ]}>
            全部
          </Text>
        </TouchableOpacity>
        
        {Object.entries(TOOL_CATEGORIES).map(([key, cat]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryChip,
              selectedCategory === key && { backgroundColor: cat.color, borderColor: cat.color }
            ]}
            onPress={() => setSelectedCategory(key)}
          >
            <Ionicons 
              name={cat.icon} 
              size={14} 
              color={selectedCategory === key ? '#fff' : '#64748b'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === key && styles.categoryTextActive
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 工具网格 */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTools).map(([category, tools]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={TOOL_CATEGORIES[category]?.icon || 'apps'} 
                size={16} 
                color={TOOL_CATEGORIES[category]?.color || '#64748b'} 
              />
              <Text style={styles.categoryTitle}>
                {TOOL_CATEGORIES[category]?.name || '其他'}
              </Text>
              <Text style={styles.toolCount}>({tools.length})</Text>
            </View>
            
            <View style={styles.toolsGrid}>
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  onPress={() => handlePress(tool)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: tool.color }]}>
                    <Ionicons name={tool.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.toolTitle} numberOfLines={1}>
                    {tool.title}
                  </Text>
                  <Text style={styles.toolDesc} numberOfLines={2}>
                    {tool.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filteredTools.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>没有找到相关工具</Text>
            <Text style={styles.emptySubtext}>试试其他关键词</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#334155",
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  categoryText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  toolCount: {
    fontSize: 13,
    color: "#94a3b8",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toolCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },
});
