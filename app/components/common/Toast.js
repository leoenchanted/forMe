import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- 堆叠常量 (可根据实际 UI 微调) ---
const TOAST_HEIGHT = 44; 
const MARGIN_TOP = 10;
const BASE_TOP_OFFSET = 50; 
const STACKING_UNIT = TOAST_HEIGHT + MARGIN_TOP; 

export default function Toast({ message, type = 'success', offsetIndex, onHide, duration = 3000 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  // 初始化 translateY 为屏幕外 -100，确保进场动画从上方滑入
  const translateY = useRef(new Animated.Value(-100)).current; 

  // 目标垂直位置：根据 index 动态计算
  const targetY = BASE_TOP_OFFSET + (offsetIndex * STACKING_UNIT);

  // 1. 进场和位置更新逻辑
  useEffect(() => {
    
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }),
      Animated.spring(translateY, { 
        toValue: targetY, // 移动到计算出的堆叠位置
        friction: 8, // 摩擦力，使运动更平稳
        tension: 50, // 张力
        useNativeDriver: true 
      })
    ]).start();

  }, [offsetIndex, targetY]); // 监听 offsetIndex 变化，实现平滑上顶

  // 2. 自动消失和出场逻辑
  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      // 移出屏幕上方
      Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }) 
    ]).start(() => onHide && onHide()); // 动画完成后，通知 Provider 移除自身
  }, [onHide, fadeAnim, translateY]);

  // 3. 自动消失计时器 (独立计时)
  useEffect(() => {
    const timer = setTimeout(() => {
      hide();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, hide]);

  const iconName = type === 'success' ? "checkmark-circle" : type === 'error' ? "close-circle" : "alert-circle";
  const iconColor = type === 'success' ? "#4ade80" : type === 'error' ? "#f87171" : "#0ea5e9"; 

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY }] 
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={iconName} 
          size={20} 
          color={iconColor} 
        />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 99999, // 确保 Toast 在最顶层
  },
  content: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 30, 
    gap: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 10 
  },
  text: { 
    color: '#fff', 
    fontFamily: 'Poppins_600SemiBold', // 字体已恢复
    fontSize: 14 
  }
});