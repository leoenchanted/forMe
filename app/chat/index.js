import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.deepseek.com/v1/chat/completions');
  const [model, setModel] = useState('deepseek-chat');

  // 加载API配置
  React.useEffect(() => {
    loadApiConfig();
  }, []);

  const loadApiConfig = async () => {
    try {
      // 优先从 AsyncStorage 加载用户保存的配置
      const savedApiKey = await AsyncStorage.getItem('aiApiKey');
      const savedApiUrl = await AsyncStorage.getItem('aiApiUrl');
      const savedModel = await AsyncStorage.getItem('aiModel');

      if (savedApiKey) setApiKey(savedApiKey);
      if (savedApiUrl) setApiUrl(savedApiUrl);
      if (savedModel) setModel(savedModel);

      // 如果没有保存的配置，尝试从环境变量加载
      if (!savedApiKey && Constants.expoConfig?.extra?.aiApiKey) {
        setApiKey(Constants.expoConfig.extra.aiApiKey);
      }
      if (!savedApiUrl && Constants.expoConfig?.extra?.aiApiUrl) {
        setApiUrl(Constants.expoConfig.extra.aiApiUrl);
      }
      if (!savedModel && Constants.expoConfig?.extra?.aiModel) {
        setModel(Constants.expoConfig.extra.aiModel);
      }
    } catch (error) {
      console.error('加载API配置失败:', error);
    }
  };

  const saveApiConfig = async () => {
    try {
      await AsyncStorage.setItem('aiApiKey', apiKey);
      await AsyncStorage.setItem('aiApiUrl', apiUrl);
      await AsyncStorage.setItem('aiModel', model);
      setShowApiModal(false);
      Alert.alert('成功', 'API配置已保存');
    } catch (error) {
      console.error('保存API配置失败:', error);
      Alert.alert('错误', '保存配置失败');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!apiKey) {
      Alert.alert('提示', '请先配置API密钥', [
        { text: '取消', style: 'cancel' },
        { text: '配置', onPress: () => setShowApiModal(true) }
      ]);
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        let errorMessage = `API请求失败: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // 无法解析错误响应，使用默认信息
        }
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      Alert.alert('错误', error.message || '发送消息失败，请检查API配置');
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isLastAssistant = !isUser && index === messages.length - 1 && isLoading;
    const displayContent = isLastAssistant ? streamingContent || message.content : message.content;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={20} color="#6366f1" />
            </View>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          {isUser ? (
            <Text style={styles.userText}>{displayContent}</Text>
          ) : (
            <Text style={styles.assistantText}>{displayContent}</Text>
          )}
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI 助手</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, apiKey ? styles.statusActive : styles.statusInactive]} />
            <Text style={styles.statusText}>{apiKey ? '已连接' : '未配置'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowApiModal(true)} style={styles.headerBtn}>
          <Ionicons name="settings" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && streamingContent && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.avatarContainer}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={20} color="#6366f1" />
              </View>
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color="#6366f1" style={styles.loadingIndicator} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="输入消息..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* API Config Modal */}
      <Modal
        visible={showApiModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API 配置</Text>
              <TouchableOpacity onPress={() => setShowApiModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API URL</Text>
              <TextInput
                style={styles.modalInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="https://api.deepseek.com/v1/chat/completions"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.modalInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="输入你的API密钥"
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>模型</Text>
              <TextInput
                style={styles.modalInput}
                value={model}
                onChangeText={setModel}
                placeholder="deepseek-chat"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveApiConfig}>
              <Text style={styles.saveBtnText}>保存配置</Text>
            </TouchableOpacity>

            <Text style={styles.hintText}>
              支持 OpenAI 格式 API，包括 DeepSeek 等第三方服务
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  paragraph: {
    marginVertical: 4,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  bullet_list: {
    marginLeft: 8,
  },
  ordered_list: {
    marginLeft: 8,
  },
  list_item: {
    marginVertical: 2,
  },
  link: {
    color: '#6366f1',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    paddingLeft: 12,
    marginVertical: 8,
    color: '#94a3b8',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusActive: {
    backgroundColor: '#22c55e',
  },
  statusInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  assistantText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 16,
  },
});

