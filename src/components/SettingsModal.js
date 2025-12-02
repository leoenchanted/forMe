import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function SettingsModal({ visible, currentKey, onSave, onClose }) {
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    if (currentKey) setKeyInput(currentKey);
  }, [currentKey]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Setup API Key</Text>
          <Text style={styles.modalDesc}>Paste your Unsplash Access Key:</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="Access Key..." 
            value={keyInput}
            onChangeText={setKeyInput} 
            autoCapitalize="none"
          />
          <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
             {onClose && (
                <TouchableOpacity onPress={onClose} style={[styles.btn, {backgroundColor: '#e2e8f0', flex:1}]}>
                    <Text style={{color: '#64748b'}}>Cancel</Text>
                </TouchableOpacity>
             )}
             <TouchableOpacity onPress={() => onSave(keyInput)} style={[styles.btn, {backgroundColor: '#6366f1', flex:2}]}>
                 <Text style={{color: '#fff', fontWeight: 'bold'}}>Save & Start</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', marginBottom: 10, color: '#1e293b' },
  modalDesc: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16, fontSize: 15, marginBottom: 20, backgroundColor: '#f8fafc' },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});