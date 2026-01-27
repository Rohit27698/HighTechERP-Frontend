import React from 'react';

/**
 * StatusBadge Component
 * Displays status with appropriate color coding
 * 
 * @param {string} status - The status value
 * @param {string} type - 'order' or 'payment' (default: 'order')
 * @param {boolean} size - 'sm', 'md', 'lg' (default: 'md')
 */
export default function StatusBadge({ status, type = 'order', size = 'md' }) {
  const statusStyles = {
    order: {
      pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
      processing: { bg: '#dbeafe', text: '#1e40af', icon: '⚙️' },
      shipped: { bg: '#d1fae5', text: '#065f46', icon: '📦' },
      delivered: { bg: '#d1fae5', text: '#065f46', icon: '✓' },
      cancelled: { bg: '#fee2e2', text: '#991b1b', icon: '✕' },
    },
    payment: {
      pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
      completed: { bg: '#d1fae5', text: '#065f46', icon: '✓' },
      failed: { bg: '#fee2e2', text: '#991b1b', icon: '✕' },
      refunded: { bg: '#e0e7ff', text: '#3730a3', icon: '↩' },
    },
  };

  const sizeStyles = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.85rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '0.95rem' },
  };

  const styles = (type === 'payment' ? statusStyles.payment : statusStyles.order)[status] || {
    bg: '#f3f4f6',
    text: '#374151',
    icon: '•',
  };

  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: sizeStyle.padding,
        backgroundColor: styles.bg,
        color: styles.text,
        borderRadius: '16px',
        fontSize: sizeStyle.fontSize,
        fontWeight: '600',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{styles.icon}</span>
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
}
