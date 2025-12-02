import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterChip({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      {icon && <Ionicons name={icon} size={14} color={active ? "#6366f1" : "#64748b"} style={{marginRight: 4}} />}
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  filterChipActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#6366f1' },
  filterText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#64748b' },
  filterTextActive: { color: '#6366f1', fontFamily: 'Poppins_600SemiBold' },
});