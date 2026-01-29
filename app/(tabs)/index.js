import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
// 引入 API
import { fetchRealtimeWeather } from '../../src/api/weather';
import { fetchDailyQuote } from '../../src/api/quote';
 
export default function HomeScreen() {
  const [bgImage, setBgImage] = useState(null);
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'Loading...',
    icon: 'partly-sunny',
    city: 'Your City'
  });
  const [quote, setQuote] = useState({
    en: 'Loading...',
    zh: '加载中...',
    source: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState('beijing'); // 默认城市，可以改成你的城市

  useEffect(() => {
    loadBg();
    fetchData();
  }, []);

  const loadBg = async () => {
    try {
      const saved = await AsyncStorage.getItem('home_bg');
      // 安全检查：只有以 file:// 开头的才是有效的本地图片路径
      if (saved && saved.startsWith('file://')) {
        setBgImage(saved);
      } else if (saved) {
        // 如果存的是垃圾数据，删掉它
        console.log("发现无效背景图数据，已清除");
        await AsyncStorage.removeItem('home_bg');
      }
    } catch (e) {
      console.error("读取背景图失败:", e);
    }
  };

  const fetchData = async () => {
    setRefreshing(true);

    // 获取 API Keys
    const qweatherApiKey = Constants.expoConfig?.extra?.qweatherApiKey;

    try {
      // 并行获取天气和每日一句
      const [weatherData, quoteData] = await Promise.all([
        fetchRealtimeWeather(location, qweatherApiKey),
        fetchDailyQuote()
      ]);

      // 更新天气数据
      if (weatherData) {
        setWeather({
          temp: `${weatherData.temp}°`,
          condition: weatherData.condition,
          icon: weatherData.icon,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
        });
      }

      // 更新每日一句
      if (quoteData) {
        setQuote({
          en: quoteData.en,
          zh: quoteData.zh,
          source: quoteData.source,
        });
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const changeBg = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true, // 允许裁剪
        aspect: [9, 16],     // 限制比例，防止图片过大
        quality: 0.7,        // 压缩质量 (0-1)，0.7 可以有效防止内存溢出闪退！
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setBgImage(uri);
        await AsyncStorage.setItem('home_bg', uri);
      }
    } catch (e) {
      console.log("选图取消或失败:", e);
    }
  };

  // 安全的 Image 源对象
  const bgSource = bgImage ? { uri: bgImage } : null;

  return (
    <ImageBackground 
        source={bgSource} 
        style={styles.bg} 
        resizeMode="cover"
        // 默认背景色，防止图片加载慢时白屏
        imageStyle={{ backgroundColor: '#0f172a' }}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>{new Date().toDateString()}</Text>
              <Text style={styles.greeting}>Hi, CreatoWr!</Text>
            </View>
            <TouchableOpacity onPress={changeBg} style={styles.iconBtn}>
              <Ionicons name="image-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#fff"/>}
          >
            {/* Weather Card */}
            <View style={styles.card}>
              <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                <Ionicons name={weather.icon} size={40} color="#fbbf24" />
                <View>
                  <Text style={styles.temp}>{weather.temp}</Text>
                  <Text style={styles.condition}>{weather.condition}</Text>
                </View>
              </View>
              {/* 额外的天气信息 */}
              {weather.humidity && (
                <View style={{flexDirection:'row', gap:20, marginTop:12, paddingTop:12, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.1)'}}>
                  <View>
                    <Text style={styles.weatherLabel}>湿度</Text>
                    <Text style={styles.weatherValue}>{weather.humidity}%</Text>
                  </View>
                  <View>
                    <Text style={styles.weatherLabel}>风速</Text>
                    <Text style={styles.weatherValue}>{weather.windSpeed}km/h</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Quote Card */}
            <View style={[styles.card, { marginTop: 20 }]}>
              <Text style={styles.quoteTitle}>Daily Inspiration</Text>
              <Text style={styles.quoteText}>"{quote.en}"</Text>
              {quote.zh && quote.zh !== quote.en && (
                <Text style={styles.quoteZh}>{quote.zh}</Text>
              )}
              {quote.source && (
                <Text style={styles.quoteSource}>— {quote.source}</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0f172a' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  date: { color: '#cbd5e1', fontSize: 12, textTransform: 'uppercase' },
  greeting: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10)' },
  scroll: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  temp: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  condition: { color: '#cbd5e1', fontSize: 14 },
  weatherLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  weatherValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  quoteTitle: { color: '#818cf8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  quoteText: { color: '#fff', fontSize: 18, fontStyle: 'italic', lineHeight: 26 },
  quoteZh: { color: '#cbd5e1', fontSize: 14, marginTop: 8, lineHeight: 20 },
  quoteSource: { color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'right', fontStyle: 'italic' }
});