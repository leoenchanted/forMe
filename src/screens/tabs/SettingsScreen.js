import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);

  const checkUpdate = async () => {
    setChecking(true);
    setTimeout(() => {
        setChecking(false);
        Alert.alert("Update", "You are using the latest version: v" + (Constants.expoConfig.version || '1.0.0'));
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.section}>
        <View style={styles.row}>
            <Text style={styles.label}>Current Version</Text>
            <Text style={styles.value}>v{Constants.expoConfig.version}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={checkUpdate} disabled={checking}>
            {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Check for Updates</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', padding: 20 },
  section: { padding: 20, gap: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  label: { fontSize: 16, color: '#334155' },
  value: { fontSize: 16, color: '#94a3b8' },
  btn: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});