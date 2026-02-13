import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";

// 组件
import UserProfile from "../components/home/UserProfile";
import WeatherCard from "../components/home/WeatherCard";
import QuoteCard from "../components/home/QuoteCard";
import HoroscopeCard from "../components/home/HoroscopeCard";
import SunCard from "../components/home/SunCard";
import HomeToolbar from "../components/home/HomeToolbar";

// API
import { fetchRealtimeWeather } from "../lib/api/weather";
import { fetchDailyQuote } from "../lib/api/quote";
import { fetchSunriseSunset, isDaytime, getTimeUntilNextEvent } from "../lib/api/sunriseSunset";

// 工具
import { getUsername, getZodiacSign, setZodiacSign, getHomeBg, setHomeBg } from "../lib/utils/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchHoroscopeFromAPI } from "../lib/utils/zodiac";
import {
  AVAILABLE_COMPONENTS,
  getComponentConfigKey,
  getComponentVisibilityKey,
} from "../lib/utils/componentConfig";

export default function HomeScreen() {
  const [bgImage, setBgImage] = useState(null);
  const [username, setUsernameState] = useState("User");
  
  // 组件显示状态
  const [componentVisibility, setComponentVisibility] = useState({});
  const [componentConfig, setComponentConfig] = useState({});

  const [weather, setWeather] = useState({
    temp: "--",
    condition: "Loading...",
    icon: "partly-sunny",
    city: "Your City",
  });

  const [quote, setQuote] = useState({
    en: "Loading...",
    zh: "加载中...",
    source: "",
  });

  const [zodiacSign, setZodiacSignState] = useState("aries");
  const [fortune, setFortune] = useState(null);

  const [sunData, setSunData] = useState({
    sunrise: "06:30",
    sunset: "18:45",
    dayLength: "12:15:00",
    isDaytime: true,
    nextEvent: { type: 'sunset', minutes: 480, time: '18:45' },
  });

  const [refreshing, setRefreshing] = useState(false);

  // 加载组件配置
  const loadComponentSettings = useCallback(async () => {
    try {
      const visibility = {};
      const config = {};

      for (const [id, component] of Object.entries(AVAILABLE_COMPONENTS)) {
        const visibleKey = getComponentVisibilityKey(id);
        const configKey = getComponentConfigKey(id);
        
        const visibleStr = await AsyncStorage.getItem(visibleKey);
        visibility[id] = visibleStr !== null ? JSON.parse(visibleStr) : component.defaultVisible;
        
        const cfgStr = await AsyncStorage.getItem(configKey);
        config[id] = cfgStr ? JSON.parse(cfgStr) : {};
      }

      setComponentVisibility(visibility);
      setComponentConfig(config);
    } catch (e) {
      console.error('加载组件设置失败:', e);
    }
  }, []);

  // 加载用户数据
  const loadUserData = useCallback(async () => {
    try {
      const [bg, user] = await Promise.all([
        getHomeBg(),
        getUsername(),
      ]);
      
      if (bg) setBgImage(bg);
      if (user) setUsernameState(user);
    } catch (e) {
      console.error("加载用户数据失败:", e);
    }
  }, []);

  // 使用 useFocusEffect 监听页面聚焦事件
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadComponentSettings();
      // 设置一个定时器，确保数据刷新
      const timer = setTimeout(() => {
        loadComponentSettings();
      }, 100);
      return () => clearTimeout(timer);
    }, [loadUserData, loadComponentSettings])
  );

  // 监听组件配置变化，自动刷新星座数据
  useEffect(() => {
    if (componentConfig.horoscope?.zodiacSign && componentConfig.horoscope.zodiacSign !== zodiacSign) {
      const newSign = componentConfig.horoscope.zodiacSign;
      setZodiacSignState(newSign);
      fetchHoroscopeFromAPI(newSign).then(setFortune);
    }
  }, [componentConfig.horoscope?.zodiacSign]);

  // 监听组件配置变化，自动刷新天气数据
  useEffect(() => {
    if (componentConfig.weather?.city) {
      // 获取和风天气API Key
      const qweatherApiKey = Constants.expoConfig?.extra?.qweatherApiKey;
      // 重新获取天气数据
      fetchRealtimeWeather(componentConfig.weather.city, qweatherApiKey).then(data => {
        if (data) {
          setWeather({
            temp: `${data.temp}°`,
            condition: data.condition,
            icon: data.icon,
            city: data.city || componentConfig.weather.city,
            humidity: data.humidity,
            windSpeed: data.windSpeed,
          });
        }
      });
    }
  }, [componentConfig.weather?.city]);

  // 初始化数据
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const sign = await getZodiacSign();
      
      if (sign) {
        setZodiacSignState(sign);
        const f = await fetchHoroscopeFromAPI(sign);
        setFortune(f);
      }
      
      await loadComponentSettings();
      fetchData();
    } catch (e) {
      console.error("初始化失败:", e);
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    
    // 获取和风天气API Key
    const qweatherApiKey = Constants.expoConfig?.extra?.qweatherApiKey;
    
    // 重新加载组件配置以获取最新城市设置
    await loadComponentSettings();
    
    const weatherConfig = componentConfig.weather || {};
    const location = weatherConfig.city || "beijing";

    try {
      const [weatherData, quoteData, sunDataRaw] = await Promise.all([
        fetchRealtimeWeather(location, qweatherApiKey),
        fetchDailyQuote(),
        fetchSunriseSunset(39.9042, 116.4074),
      ]);

      if (weatherData) {
        setWeather({
          temp: `${weatherData.temp}°`,
          condition: weatherData.condition,
          icon: weatherData.icon,
          city: weatherData.city || location,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
        });
      }

      if (quoteData) {
        setQuote({
          en: quoteData.en,
          zh: quoteData.zh,
          source: quoteData.source,
        });
      }

      if (sunDataRaw.success) {
        const isDay = isDaytime(sunDataRaw.sunrise, sunDataRaw.sunset);
        const nextEvent = getTimeUntilNextEvent(sunDataRaw.sunrise, sunDataRaw.sunset);
        setSunData({
          ...sunDataRaw,
          isDaytime: isDay,
          nextEvent,
        });
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // 更换背景
  const changeBg = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setBgImage(uri);
        await setHomeBg(uri);
      }
    } catch (e) {
      console.log("选图失败:", e);
    }
  };

  // 切换星座
  const handleSelectZodiac = async (signId) => {
    setZodiacSignState(signId);
    await setZodiacSign(signId);
    const f = await fetchHoroscopeFromAPI(signId);
    setFortune(f);
  };

  // 渲染卡片
  const renderCard = (componentId, card) => {
    if (!componentVisibility[componentId]) return null;
    
    return (
      <BlurView key={componentId} intensity={60} tint="light" style={styles.blurView}>
        {card}
      </BlurView>
    );
  };

  const bgSource = bgImage ? { uri: bgImage } : null;

  return (
    <ImageBackground
      source={bgSource}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ backgroundColor: "#0f172a" }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* 头部 */}
          <View style={styles.header}>
            <UserProfile username={username} />
            <HomeToolbar onChangeBackground={changeBg} />
          </View>

          {/* 主内容 */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchData}
                tintColor="#fff"
              />
            }
          >
            {/* 卡片网格 */}
            <View style={styles.grid}>
              {/* 第一行：天气 + 日出日落 */}
              {(componentVisibility.weather || componentVisibility.sunriseSunset) && (
                <View style={styles.gridRow}>
                  {componentVisibility.weather && (
                    <View style={styles.gridItem}>
                      <View style={styles.glassCard}>
                        {renderCard('weather', <WeatherCard weather={weather} />)}
                      </View>
                    </View>
                  )}
                  {componentVisibility.sunriseSunset && (
                    <View style={styles.gridItem}>
                      <View style={styles.glassCard}>
                        {renderCard('sunriseSunset', <SunCard sunData={sunData} />)}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* 第二行：星座运势 */}
              {componentVisibility.horoscope && fortune && (
                <View style={styles.fullWidthCard}>
                  <View style={styles.glassCard}>
                    {renderCard('horoscope', 
                      <HoroscopeCard
                        fortune={fortune}
                        onSelectSign={handleSelectZodiac}
                      />
                    )}
                  </View>
                </View>
              )}

              {/* 第三行：每日一句 */}
              {componentVisibility.dailyQuote && (
                <View style={styles.fullWidthCard}>
                  <View style={styles.glassCard}>
                    {renderCard('dailyQuote', <QuoteCard quote={quote} />)}
                  </View>
                </View>
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { 
    flex: 1, 
    backgroundColor: "#0f172a" 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.2)" 
  },
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
  },
  scrollContent: { 
    padding: 20,
    paddingTop: 0,
  },
  grid: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  fullWidthCard: {
    width: '100%',
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurView: {
    flex: 1,
  },
});
