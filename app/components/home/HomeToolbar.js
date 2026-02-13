import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeToolbar({ onChangeBackground }) {
  const [showMenu, setShowMenu] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));
  const router = useRouter();

  const openMenu = () => {
    setShowMenu(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowMenu(false));
  };

  const menuItems = [
    {
      id: 'changeBg',
      name: '修改背景',
      icon: 'image',
      onPress: () => {
        closeMenu();
        setTimeout(() => onChangeBackground(), 300);
      },
    },
    {
      id: 'componentSettings',
      name: '组件设置',
      icon: 'grid',
      onPress: () => {
        closeMenu();
        setTimeout(() => router.push('/settings/components'), 300);
      },
    },
    {
      id: 'chat',
      name: 'AI 对话',
      icon: 'chatbubble',
      onPress: () => {
        closeMenu();
        setTimeout(() => router.push('/chat'), 300);
      },
    },
  ];

  return (
    <>
      {/* 工具栏按钮 */}
      <TouchableOpacity onPress={openMenu} style={styles.toolbarBtn}>
        <BlurView intensity={80} tint="light" style={styles.blurBtn}>
          <Ionicons name="apps" size={20} color="#fff" />
        </BlurView>
      </TouchableOpacity>

      {/* 菜单弹窗 */}
      <Modal
        visible={showMenu}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <BlurView intensity={80} tint="light" style={styles.menuBlur}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>工具</Text>
                <TouchableOpacity onPress={closeMenu}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index === menuItems.length - 1 && styles.menuItemLast
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIconContainer}>
                      <Ionicons name={item.icon} size={24} color="#6366f1" />
                    </View>
                    <Text style={styles.menuItemText}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toolbarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 0,
  },
  blurBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuContainer: {
    position: 'absolute',
    right: 16,
    top: 80,
    width: 220,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuItems: {
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
});
