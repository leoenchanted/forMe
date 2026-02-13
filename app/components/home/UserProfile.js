import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserProfile({ username }) {
  const colors = {
    text: '#fff',
    textMuted: 'rgba(255,255,255,0.7)',
    accent: '#60a5fa',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getFormattedDate = () => {
    const now = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = weekdays[now.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {getFormattedDate()}
        </Text>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting()}，
        </Text>
        <Text style={[styles.username, { color: colors.accent }]}>
          {username}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  leftSection: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
