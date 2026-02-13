import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function SettingsModal({ visible, currentKey, onSave, onClose }) {
  const [keyInput, setKeyInput] = useState('');

  // 当外部传入 currentKey 时，同步到输入框
  useEffect(() => { 
    if (currentKey) setKeyInput(currentKey); 
  }, [currentKey]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>API Settings</Text>
          
          <Text style={styles.label}>Unsplash Access Key</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="Paste your key here..." 
            value={keyInput}
            onChangeText={setKeyInput} 
            autoCapitalize="none"
            secureTextEntry={true} // 稍微遮挡一下，显得安全点
          />

          <View style={styles.btnRow}>
             <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
                <Text style={styles.cancelText}>Cancel</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => onSave(keyInput)} style={[styles.btn, styles.saveBtn]}>
                 <Text style={styles.saveText}>Save Key</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: 20, color: '#1e293b', textAlign:'center' },
  label: { fontSize: 12, color: '#64748b', marginBottom: 8, fontFamily: 'Poppins_600SemiBold' },
  modalInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 24, backgroundColor: '#f8fafc', color: '#334155' },
  
  btnRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#0f172a' },
  cancelText: { color: '#64748b', fontFamily: 'Poppins_600SemiBold' },
  saveText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }
});