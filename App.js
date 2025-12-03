import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import { DownloadProvider, useDownloads } from './src/context/DownloadContext'; // 引入 hook

import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DownloadScreen from './src/screens/DownloadScreen';
import Toast from './src/components/Toast'; // 引入我们漂亮的弹窗

const Stack = createNativeStackNavigator();

// 创建一个子组件来消费 Context，因为 App 组件自己在 Provider 外面，用不了 useDownloads
function AppContent() {
  const { notification, hideGlobalToast } = useDownloads(); // 获取全局通知状态

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Downloads" component={DownloadScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* 全局弹窗放在这里，层级最高 */}
      <Toast 
        visible={notification.visible} 
        message={notification.msg} 
        type={notification.type} 
        onHide={hideGlobalToast} 
      />
    </>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold,
  });

  if (!fontsLoaded) return <ActivityIndicator />;

  return (
    <SafeAreaProvider>
      <DownloadProvider>
         {/* 把内容拆出去，这样 AppContent 就在 Provider 里面了 */}
         <AppContent />
      </DownloadProvider>
    </SafeAreaProvider>
  );
}