"use client";

import React from "react";

type AdBoxProps = {
  children?: React.ReactNode;
};

export default function AdBox({ children }: AdBoxProps) {
  return (
    <aside style={{
      width: '100%',
      maxWidth: '24rem',
      margin: '1.5rem auto',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '0.75rem 1rem',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#64748b'
    }}>
      <div style={{
        marginBottom: '0.25rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        fontSize: '10px',
        textTransform: 'uppercase',
        color: '#94a3b8'
      }}>
        Advertisement
      </div>
      <div style={{
        fontSize: '11px',
        color: '#94a3b8'
      }}>
        helps keep the site free
      </div>
      {children && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '11px',
          color: '#cbd5e1'
        }}>
          {children}
        </div>
      )}
    </aside>
  );
}
