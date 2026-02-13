import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WeatherCard({ weather }) {
  if (!weather || weather.temp === '--') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tempRow}>
        <Ionicons name={weather.icon || 'partly-sunny'} size={28} color="#fff" />
        <Text style={styles.temp}>{weather.temp}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.condition} numberOfLines={1}>
          {weather.condition}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {weather.city || 'Local'}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.detailText}>{weather.humidity || '--'}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.detailText}>{weather.windSpeed || '--'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  temp: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoRow: {
    marginTop: 4,
  },
  condition: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  city: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 1,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
  },
});
