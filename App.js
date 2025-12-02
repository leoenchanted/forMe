// App.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// 引入 Context Provider
import { DownloadProvider } from './src/context/DownloadContext'; 

import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DownloadScreen from './src/screens/DownloadScreen'; // 引入下载页

const Stack = createNativeStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold,
  });

  if (!fontsLoaded) return <ActivityIndicator />;

  return (
    <SafeAreaProvider>
      {/* 包裹在最外层，让所有页面都能用下载功能 */}
      <DownloadProvider> 
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Downloads" component={DownloadScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DownloadProvider>
    </SafeAreaProvider>
  );
}