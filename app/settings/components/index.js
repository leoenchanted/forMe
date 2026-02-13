import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  COMPONENT_CATEGORIES,
  AVAILABLE_COMPONENTS,
  getComponentConfigKey,
  getComponentVisibilityKey,
} from '../../lib/utils/componentConfig';
import { ZODIAC_SIGNS } from '../../lib/utils/zodiac';

export default function ComponentSettingsScreen() {
  const router = useRouter();
  const [componentVisibility, setComponentVisibility] = useState({});
  const [componentConfig, setComponentConfig] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(['life']);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showZodiacModal, setShowZodiacModal] = useState(false);

  // 加载组件配置
  useEffect(() => {
    loadComponentSettings();
  }, []);

  const loadComponentSettings = async () => {
    const visibility = {};
    const config = {};

    for (const [id, component] of Object.entries(AVAILABLE_COMPONENTS)) {
      const visibleKey = getComponentVisibilityKey(id);
      const configKey = getComponentConfigKey(id);
      
      const visible = await AsyncStorage.getItem(visibleKey);
      visibility[id] = visible !== null ? JSON.parse(visible) : component.defaultVisible;
      
      const cfg = await AsyncStorage.getItem(configKey);
      config[id] = cfg ? JSON.parse(cfg) : {};
    }

    setComponentVisibility(visibility);
    setComponentConfig(config);
  };

  const toggleComponent = async (componentId) => {
    const newVisibility = !componentVisibility[componentId];
    setComponentVisibility(prev => ({ ...prev, [componentId]: newVisibility }));
    await AsyncStorage.setItem(
      getComponentVisibilityKey(componentId),
      JSON.stringify(newVisibility)
    );
  };

  const saveComponentConfig = async (componentId, key, value) => {
    const newConfig = { ...componentConfig[componentId], [key]: value };
    setComponentConfig(prev => ({ ...prev, [componentId]: newConfig }));
    await AsyncStorage.setItem(
      getComponentConfigKey(componentId),
      JSON.stringify(newConfig)
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveCity = async () => {
    if (cityInput.trim()) {
      await saveComponentConfig('weather', 'city', cityInput.trim());
      setShowCityModal(false);
      setCityInput('');
      Alert.alert('成功', '城市设置已保存');
    }
  };

  const renderComponentItem = (component) => {
    const isVisible = componentVisibility[component.id];
    const config = componentConfig[component.id] || {};

    return (
      <View key={component.id} style={styles.componentItem}>
        <View style={styles.componentHeader}>
          <View style={styles.componentInfo}>
            <View style={styles.componentIcon}>
              <Ionicons name={component.icon} size={20} color="#6366f1" />
            </View>
            <View style={styles.componentText}>
              <Text style={styles.componentName}>{component.name}</Text>
              <Text style={styles.componentDesc}>{component.description}</Text>
            </View>
          </View>
          <Switch
            value={isVisible}
            onValueChange={() => toggleComponent(component.id)}
            trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
            thumbColor={isVisible ? '#6366f1' : '#fff'}
          />
        </View>

        {/* 可配置项 */}
        {isVisible && component.configurable && (
          <View style={styles.configSection}>
            {component.id === 'weather' && (
              <TouchableOpacity
                style={styles.configItem}
                onPress={() => {
                  setCityInput(config.city || '');
                  setShowCityModal(true);
                }}
              >
                <Ionicons name="location" size={16} color="#64748b" />
                <Text style={styles.configLabel}>当前城市</Text>
                <Text style={styles.configValue}>{config.city || '北京'}</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
            {component.id === 'horoscope' && (
              <TouchableOpacity
                style={styles.configItem}
                onPress={() => {
                  setShowZodiacModal(true);
                }}
              >
                <Ionicons name="star" size={16} color="#64748b" />
                <Text style={styles.configLabel}>当前星座</Text>
                <Text style={styles.configValue}>
                  {ZODIAC_SIGNS.find(z => z.id === config.zodiacSign)?.name || '白羊座'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>组件设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.values(COMPONENT_CATEGORIES).map(category => (
          <View key={category.id} style={styles.categorySection}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={styles.categoryInfo}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={category.icon} size={20} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                </View>
              </View>
              <Ionicons
                name={expandedCategories.includes(category.id) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>

            {expandedCategories.includes(category.id) && (
              <View style={styles.componentsList}>
                {Object.values(AVAILABLE_COMPONENTS)
                  .filter(c => c.category === category.id)
                  .map(renderComponentItem)}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 城市设置弹窗 */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>设置城市</Text>
            <TextInput
              style={styles.modalInput}
              value={cityInput}
              onChangeText={setCityInput}
              placeholder="输入城市名称"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowCityModal(false)}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveCity}
              >
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 星座选择弹窗 */}
      <Modal
        visible={showZodiacModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowZodiacModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择星座</Text>
              <TouchableOpacity onPress={() => setShowZodiacModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.zodiacScroll}>
              <View style={styles.zodiacGrid}>
                {ZODIAC_SIGNS.map(zodiac => (
                  <TouchableOpacity
                    key={zodiac.id}
                    style={[
                      styles.zodiacItem,
                      componentConfig.horoscope?.zodiacSign === zodiac.id && styles.zodiacItemSelected
                    ]}
                    onPress={() => {
                      saveComponentConfig('horoscope', 'zodiacSign', zodiac.id);
                      setShowZodiacModal(false);
                    }}
                  >
                    <Text style={[
                      styles.zodiacIcon,
                      componentConfig.horoscope?.zodiacSign === zodiac.id && styles.zodiacIconSelected
                    ]}>{zodiac.icon}</Text>
                    <Text style={[
                      styles.zodiacName,
                      componentConfig.horoscope?.zodiacSign === zodiac.id && styles.zodiacNameSelected
                    ]}>{zodiac.name}</Text>
                    <Text style={[
                      styles.zodiacDate,
                      componentConfig.horoscope?.zodiacSign === zodiac.id && styles.zodiacDateSelected
                    ]}>{zodiac.date}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  componentsList: {
    marginTop: 12,
    gap: 12,
  },
  componentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  componentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  componentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentText: {
    flex: 1,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  componentDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  configSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  configValue: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    textAlign: 'right',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  cancelText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  zodiacScroll: {
    maxHeight: 400,
  },
  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zodiacItem: {
    width: '30%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  zodiacItemSelected: {
    backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  zodiacIcon: {
    fontSize: 32,
    marginBottom: 6,
    color: '#64748b',
    fontWeight: 'bold',
  },
  zodiacIconSelected: {
    color: '#fff',
  },
  zodiacName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  zodiacNameSelected: {
    color: '#fff',
  },
  zodiacDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  zodiacDateSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
});
