'use client';

import { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose: () => void;
}

export default function Notification({ message, type, duration = 8000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const colors = {
    success: {
      bg: '#d4edda',
      border: '#28a745',
      text: '#155724',
      icon: '✅'
    },
    error: {
      bg: '#f8d7da',
      border: '#dc3545',
      text: '#721c24',
      icon: '❌'
    },
    info: {
      bg: '#d1ecf1',
      border: '#17a2b8',
      text: '#0c5460',
      icon: 'ℹ️'
    },
    warning: {
      bg: '#fff3cd',
      border: '#ffc107',
      text: '#856404',
      icon: '⚠️'
    }
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: isVisible && !isExiting ? '1rem' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '90%',
        width: 'auto',
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        pointerEvents: 'auto'
      }}
    >
      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
        {style.icon}
      </div>
      <div style={{ flex: 1, color: style.text }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: '0.95rem',
          marginBottom: message.length > 50 ? '0.25rem' : 0,
          lineHeight: 1.4
        }}>
          {message}
        </div>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: style.text,
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: '0',
          lineHeight: 1,
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        ✕
      </button>
    </div>
  );
}
