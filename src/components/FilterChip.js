import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterChip({ label, icon, active, onPress }) {
  // 定义固定主题色 (indigo-500)
  const ACTIVE_COLOR = '#6366f1'; 

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.filterChip, 
        active && { borderWidth: 1, borderColor: ACTIVE_COLOR, backgroundColor: '#fff' } 
      ]}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={14} 
          color={active ? ACTIVE_COLOR : '#64748b'} 
          style={{marginRight: 4}} 
        />
      )}
      
      <Text style={[
        styles.filterText, 
        { color: '#64748b' }, 
        active && { color: ACTIVE_COLOR, fontFamily: 'Poppins_600SemiBold' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'transparent', 
    backgroundColor: '#fff' 
  },
  filterText: { fontSize: 13, fontFamily: 'Poppins_400Regular' },
});