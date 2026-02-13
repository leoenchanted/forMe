import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.error('加载主题失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      setTheme(mode);
      await AsyncStorage.setItem('theme_mode', mode);
    } catch (e) {
      console.error('保存主题失败:', e);
    }
  };

  // 获取主题颜色配置
  const getThemeColors = () => {
    if (isDark) {
      return {
        background: '#0f172a',
        surface: '#1e293b',
        surfaceVariant: '#334155',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        border: '#334155',
        card: '#1e293b',
        accent: '#6366f1',
        accentLight: '#818cf8',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      };
    }
    return {
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceVariant: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      card: '#ffffff',
      accent: '#6366f1',
      accentLight: '#818cf8',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    };
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, isDark, setIsDark, getThemeColors, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
