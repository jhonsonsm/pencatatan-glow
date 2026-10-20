import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;



  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: type === 'warning' ? '#a66b19' : (type === 'info' ? '#152e39' : '#147d72'),
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'fadeInUp 0.25s ease-out',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.15)'
      }}
    >
      <span>🔔</span>
      <span>{message}</span>
    </div>
  );
};
