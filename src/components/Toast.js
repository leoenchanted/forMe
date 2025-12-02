import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Toast({ message, type = 'success', visible, onHide }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // 显示动画
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 50, friction: 5, useNativeDriver: true })
      ]).start();

      // 2秒后自动消失
      const timer = setTimeout(() => {
        hide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -50, duration: 300, useNativeDriver: true })
    ]).start(() => onHide && onHide());
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      <View style={styles.content}>
        <Ionicons 
          name={type === 'success' ? "checkmark-circle" : "alert-circle"} 
          size={20} 
          color={type === 'success' ? "#4ade80" : "#f87171"} 
        />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 9999 },
  content: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, gap: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  text: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }
});