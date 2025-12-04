import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkAndUpdate } from '../utils/update'; // 引入刚才写的工具
import * as Application from 'expo-application'; // 显示当前版本号

export default function SettingsModal({ visible, currentKey, onSave, onClose }) {
  const [keyInput, setKeyInput] = useState('');
  const version = Application.nativeApplicationVersion; // 获取版本号

  useEffect(() => { if (currentKey) setKeyInput(currentKey); }, [currentKey]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          
          <Text style={styles.label}>Unsplash API Key</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="Access Key..." 
            value={keyInput}
            onChangeText={setKeyInput} 
            autoCapitalize="none"
          />

          {/* 新增：检查更新区域 */}
          <View style={styles.updateSection}>
              <Text style={styles.versionText}>Current Version: v{version}</Text>
              <TouchableOpacity onPress={checkAndUpdate} style={styles.updateBtn}>
                  <Ionicons name="cloud-upload-outline" size={16} color="#6366f1" />
                  <Text style={styles.updateText}>Check for Updates</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.btnRow}>
             <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
                <Text style={styles.cancelText}>Close</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => onSave(keyInput)} style={[styles.btn, styles.saveBtn]}>
                 <Text style={styles.saveText}>Save</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', marginBottom: 20, color: '#1e293b', textAlign:'center' },
  label: { fontSize: 12, color: '#64748b', marginBottom: 8, fontFamily: 'Poppins_600SemiBold' },
  modalInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 20, backgroundColor: '#f8fafc' },
  
  // 新增样式
  updateSection: { alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12 },
  versionText: { fontSize: 12, color: '#94a3b8', marginBottom: 8, fontFamily: 'Poppins_400Regular' },
  updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  updateText: { color: '#6366f1', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },

  btnRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#e2e8f0' },
  saveBtn: { backgroundColor: '#6366f1' },
  cancelText: { color: '#64748b', fontFamily: 'Poppins_600SemiBold' },
  saveText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }
});