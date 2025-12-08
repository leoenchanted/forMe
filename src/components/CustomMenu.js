import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomMenu({ visible, onClose, onNavigateFav, onNavigateSettings, onNavigateDownloads }) {
  if (!visible) return null;

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              
              <TouchableOpacity onPress={() => { onClose(); onNavigateFav(); }} style={styles.menuItem}>
                <Ionicons name="heart-outline" size={18} color="#f87171" />
                <Text style={styles.menuText}>My Favorites</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />

              <TouchableOpacity onPress={() => { onClose(); onNavigateDownloads(); }} style={styles.menuItem}>
                <Ionicons name="cloud-download-outline" size={18} color="#3b82f6" />
                <Text style={styles.menuText}>Downloads</Text>
              </TouchableOpacity>

              {/* 只有当传入了 onNavigateSettings 时才显示 API 设置 */}
              {onNavigateSettings && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity onPress={() => { onClose(); onNavigateSettings(); }} style={styles.menuItem}>
                    <Ionicons name="key-outline" size={18} color="#64748b" />
                    <Text style={styles.menuText}>API Settings</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  menuContainer: { position: 'absolute', top: 60, right: 24, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 8, width: 180, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  menuText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#334155' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 }
});