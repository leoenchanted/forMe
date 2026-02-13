import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function QuoteCard({ quote }) {
  const copyToClipboard = async () => {
    if (quote && quote.en && quote.en !== 'Loading...') {
      try {
        await Clipboard.setStringAsync(`"${quote.en}" — ${quote.source || 'Unknown'}`);
      } catch (e) {
        console.log('复制失败:', e);
      }
    }
  };

  if (!quote || quote.en === 'Loading...') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>今日好句加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
          <Text style={styles.title}>每日一句</Text>
        </View>
        <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <Text style={styles.quoteText}>"{quote.en}"</Text>
      
      {quote.zh && quote.zh !== quote.en && (
        <Text style={styles.quoteZh}>{quote.zh}</Text>
      )}
      
      {quote.source && (
        <Text style={styles.source}>— {quote.source}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  copyBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  quoteText: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  quoteZh: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  source: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
