import React, { useEffect, useState } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Individual Toast component for displaying notifications
 * Requirements: 5.4
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match CSS transition duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`toast toast--${type} ${
        isVisible && !isExiting ? 'toast--visible' : ''
      } ${isExiting ? 'toast--exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon" role="img" aria-label={`${type} notification`}>
        {getIcon()}
      </div>
      
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        {message && <div className="toast__message">{message}</div>}
      </div>
      
      <button
        className="toast__close"
        onClick={handleClose}
        type="button"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;