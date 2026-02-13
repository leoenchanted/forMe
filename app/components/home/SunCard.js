import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SunCard({ sunData }) {
  const isDay = sunData.isDaytime;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={isDay ? 'sunny' : 'moon'} 
          size={18} 
          color="#fff" 
        />
        <Text style={styles.headerText}>
          {isDay ? '白天' : '夜晚'}
        </Text>
      </View>

      <View style={styles.times}>
        <View style={styles.timeItem}>
          <Ionicons name="sunny-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.timeLabel}>日出</Text>
          <Text style={styles.timeValue}>{sunData.sunrise}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.timeItem}>
          <Ionicons name="moon-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.timeLabel}>日落</Text>
          <Text style={styles.timeValue}>{sunData.sunset}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          白昼 {sunData.dayLength}
        </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  timeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
});
