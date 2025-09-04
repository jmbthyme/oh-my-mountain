import React from 'react';
import { Toast } from './Toast';
import type { ToastProps, ToastType } from './Toast';
import './ToastContainer.css';

export type { ToastType } from './Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

/**
 * Container component for managing multiple toast notifications
 * Requirements: 5.4
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;