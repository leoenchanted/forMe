import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HoroscopeCard({ fortune }) {
  const renderStars = (rating) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={12}
            color={star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.5)'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.signInfo}>
          <Text style={styles.signIcon}>{fortune.sign.icon}</Text>
          <View>
            <Text style={styles.signName}>{fortune.sign.name}</Text>
            <Text style={styles.signDate}>{fortune.sign.date}</Text>
          </View>
        </View>
        {renderStars(fortune.rating)}
      </View>
      
      <Text style={styles.fortuneText} numberOfLines={2}>
        {fortune.general}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.luckyItem}>
          <Ionicons name="color-palette" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.luckyText}>幸运色: {fortune.luckyColor}</Text>
        </View>
        <View style={styles.luckyItem}>
          <Ionicons name="dice" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.luckyText}>幸运数: {fortune.luckyNumber}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  signInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  signName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  fortuneText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  luckyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  luckyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
});
