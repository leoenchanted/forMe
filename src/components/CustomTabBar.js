import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const MARGIN = 20;
const TAB_BAR_WIDTH = width - 2 * MARGIN;

export default function CustomTabBar({ state, descriptors, navigation }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const config = [
    { name: 'Home', icon: 'home' },
    { name: 'VibeWall', icon: 'images' },
    { name: 'Tools', icon: 'grid' },
    { name: 'Settings', icon: 'settings' },
  ];

  const tabWidth = TAB_BAR_WIDTH / config.length;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/* 固定天蓝色滑块 */}
        <Animated.View
          style={[
            styles.slider,
            {
              width: tabWidth - 10,
              transform: [{ translateX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const tabConfig = config.find(c => c.name === route.name) || { icon: 'help' };
          const iconName = isFocused ? tabConfig.icon : `${tabConfig.icon}-outline`;

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={iconName} 
                size={18} 
                color={isFocused ? '#fff' : '#000'} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    bottom: 35, 
    left: MARGIN, 
    right: MARGIN, 
    alignItems: 'center' 
  },
  tabBar: { 
    flexDirection: 'row', 
    width: '100%', 
    height: 50, 
    borderRadius: 35, 
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // 半透明白色
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)', // 轻微白边
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  slider: { 
    position: 'absolute', 
    height: 36, 
    top: 8, 
    left: 5, 
    borderRadius: 27, 
    zIndex: 0, 
    backgroundColor: 'maroon' 
  },
  tabItem: { 
    flex: 1, 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1 
  },
});