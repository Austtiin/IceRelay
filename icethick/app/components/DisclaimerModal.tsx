'use client';

import { useState } from 'react';

export default function DisclaimerModal() {
  const [isVisible, setIsVisible] = useState(() => {
    // Only run on client side
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('ice-relay-disclaimer-accepted');
  });
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      localStorage.setItem('ice-relay-disclaimer-accepted', 'true');
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '650px',
        width: '100%',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FE5F55 0%, #FF8C42 100%)',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            CRITICAL SAFETY NOTICE
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.95 }}>
            Please read carefully before using Ice Relay
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '0.75rem',
              color: '#495867'
            }}>
              Ice Conditions Change Rapidly
            </h3>
            <p style={{ lineHeight: '1.7', color: '#5a5a5a' }}>
              This tool provides <strong>community-reported information only</strong>. Ice thickness 
              can vary dramatically across a single body of water and conditions change hourly due to 
              temperature, wind, currents, and other factors.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '0.75rem',
              color: '#495867'
            }}>
              This Is a Signal, Not Permission
            </h3>
            <p style={{ lineHeight: '1.7', color: '#5a5a5a' }}>
              Ice Relay reports are <strong>observed measurements</strong>, not safety certifications. 
              No report, regardless of trust score or recency, guarantees your safety. <strong>Always 
              verify conditions personally</strong> before venturing onto ice.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '0.75rem',
              color: '#495867'
            }}>
              You Assume All Risk
            </h3>
            <p style={{ lineHeight: '1.7', color: '#5a5a5a' }}>
              The creators, contributors, and maintainers of Ice Relay assume <strong>NO LIABILITY</strong> for 
              any injuries, damages, death, or losses resulting from use of this information. Ice safety 
              is your sole responsibility.
            </p>
          </div>

          <div style={{
            background: '#FFF3CD',
            border: '2px solid #F7A93D',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              fontWeight: 600, 
              color: '#856404',
              lineHeight: '1.6',
              margin: 0
            }}>
              <strong>When in doubt, stay off the ice.</strong> No activity is worth your life. 
              Trust your instincts and err on the side of caution.
            </p>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            background: '#f7f7f7',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <input
              type="checkbox"
              id="disclaimer-checkbox"
              required
              style={{ 
                marginTop: '0.25rem',
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#333' }}>
              I understand that ice conditions change rapidly and that this information is community-reported 
              only. I accept all risk and will verify conditions personally before going onto ice.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e0e0e0',
          background: '#fafafa'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            border: `2px solid ${isChecked ? 'var(--primary-medium)' : '#ddd'}`
          }}>
            <input
              type="checkbox"
              id="disclaimer-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              style={{
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>
              I understand and accept these terms
            </span>
          </label>
          
          <button
            onClick={() => {
              if (isChecked) {
                handleAccept();
              } else {
                alert('Please check the box to accept the disclaimer.');
              }
            }}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #577399 0%, #495867 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(87, 115, 153, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(87, 115, 153, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(87, 115, 153, 0.3)';
            }}
          >
            I Understand & Accept
          </button>
          <p style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#999',
            marginTop: '1rem',
            marginBottom: 0
          }}>
            By continuing, you acknowledge you have read and understood this disclaimer
          </p>
        </div>
      </div>
    </div>
  );
}
