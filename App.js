import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// 引入 Context
import { DownloadProvider } from './src/context/DownloadContext';
import { useDownloads } from './src/context/DownloadContext';

// Screens
import HomeScreen from './src/screens/tabs/HomeScreen';
import VibeWallScreen from './src/screens/tabs/VibeWallScreen';
import ToolsScreen from './src/screens/tabs/ToolsScreen';
import SettingsScreen from './src/screens/tabs/SettingsScreen';
import DeepGlowScreen from './src/screens/tools/DeepGlowScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DownloadScreen from './src/screens/DownloadScreen';

import UniversalToolScreen from './src/tools/UniversalToolScreen';

import CustomTabBar from './src/components/CustomTabBar';
import Toast from './src/components/Toast';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: 'transparent', elevation: 0, borderTopWidth: 0 } }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="VibeWall" component={VibeWallScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// 封装 App 内容以显示 Toast
function AppContent() {
  const { notification, hideGlobalToast } = useDownloads(); 

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Downloads" component={DownloadScreen} />
          <Stack.Screen name="DeepGlow" component={DeepGlowScreen} />
          <Stack.Screen name="UniversalTool" component={UniversalToolScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      
      <Toast 
        visible={notification.visible} 
        message={notification.msg} 
        type={notification.type} 
        onHide={hideGlobalToast} 
      />
    </View>
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
          <AppContent />
      </DownloadProvider>
    </SafeAreaProvider>
  );
}