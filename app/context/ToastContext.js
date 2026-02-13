import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from '../components/common/Toast'; // 引入 Toast 组件

const ToastContext = createContext();

let nextId = 0; // 用于给每个消息一个唯一的ID

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // 1. 添加消息到队列
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = nextId++;
    
    const newToast = { id, message, type, duration };

    // 将新消息添加到数组头部（实现新消息在上面堆叠）
    setToasts(prevToasts => [newToast, ...prevToasts]);
    
    // **注意：计时器已移至 Toast.js 内部**
  }, []);

  // 2. 从队列中移除消息 (由 Toast 组件完成退场动画后调用)
  const hideToast = useCallback((id) => {
    // 移除匹配 ID 的消息，这会触发剩余 Toast 的位置更新
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* 渲染所有 Toast 消息 */}
      {/* 使用 View 包裹并设置 pointerEvents="box-none"，确保 Toast 不阻挡下方点击事件 */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            offsetIndex={index} // 传递索引用于计算位置
            duration={toast.duration} 
            onHide={() => hideToast(toast.id)} // 动画完成后，Provider 移除自身
          />
        ))}
      </View>
      
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};