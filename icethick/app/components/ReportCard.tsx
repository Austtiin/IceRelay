'use client';

interface ReportCardProps {
  lakeName: string;
  thickness: number;
  timeAgo: string;
  location?: string;
  quality?: string[];
  reportCount?: number;
  surfaceType?: string;
  isMeasured?: boolean;
}

export default function ReportCard({ 
  lakeName, 
  thickness, 
  timeAgo, 
  location,
  quality,
  reportCount = 1,
  surfaceType,
  isMeasured = true
}: ReportCardProps) {
  // Minnesota ice safety recommendations
  const getSafetyInfo = (inches: number) => {
    if (inches < 4) {
      return {
        status: 'Keep off',
        icon: '🔴',
        className: 'badge-danger',
        color: '#FE5F55',
        activity: 'KEEP OFF'
      };
    } else if (inches === 4) {
      return {
        status: 'On foot / Portables',
        icon: '🟠',
        className: 'badge-warning',
        color: '#FF8C42',
        activity: 'On Foot / Portables'
      };
    } else if (inches >= 5 && inches < 7) {
      return {
        status: 'Snowmobile',
        icon: '🟡',
        className: 'badge-caution',
        color: '#F7A93D',
        activity: 'Snowmobile'
      };
    } else if (inches >= 7 && inches < 9) {
      return {
        status: 'ATV / Side-by-Side',
        icon: '🟢',
        className: 'badge-safe',
        color: '#2ECC71',
        activity: 'ATV / Side-by-Side'
      };
    } else if (inches >= 9 && inches < 13) {
      return {
        status: 'Car / Skid House',
        icon: '🔵',
        className: 'badge-truck',
        color: '#577399',
        activity: 'Car / Skid House'
      };
    } else if (inches >= 13 && inches < 20) {
      return {
        status: 'Pickup Truck',
        icon: '🟣',
        className: 'badge-heavy',
        color: '#4A90E2',
        activity: 'Pickup Truck'
      };
    } else {
      return {
        status: 'Heavy Truck + Ice House',
        icon: '⚫',
        className: 'badge-extreme',
        color: '#2C3E50',
        activity: 'Heavy Truck + Ice House'
      };
    }
  };

  const safety = getSafetyInfo(thickness);

  // Calculate trust score
  const getTrustScore = (count: number) => {
    if (count === 1) return { text: 'Single report', color: '#F7A93D', emoji: '⚠️' };
    if (count === 2) return { text: 'Verified', color: '#577399', emoji: '✓' };
    if (count >= 3) return { text: 'High confidence', color: '#4A90E2', emoji: '✓✓' };
    return { text: 'Unknown', color: '#999', emoji: '?' };
  };

  const trust = getTrustScore(reportCount);

  // Check if report is getting old
  const getAgeWarning = (timeText: string) => {
    if (timeText.includes('day') || timeText.includes('days')) {
      const days = parseInt(timeText);
      if (days >= 2) return { message: '⏰ Report aging - verify current conditions', cssClass: 'card-very-faded' };
      if (days >= 1) return { message: '⏱️ Conditions may have changed', cssClass: 'card-faded' };
    }
    return { message: null, cssClass: '' };
  };

  const ageWarning = getAgeWarning(timeAgo);

  return (
    <div className={`card ${ageWarning.cssClass}`} style={{ 
      marginBottom: '1rem', 
      position: 'relative',
      background: 'linear-gradient(135deg, #fef9e7 0%, #fff9c4 100%)',
      border: '1px solid #f4e5b8',
      borderRadius: '2px',
      boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)',
      transform: 'rotate(-0.5deg)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '280px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)';
      e.currentTarget.style.boxShadow = '5px 5px 15px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'rotate(-0.5deg) translateY(0)';
      e.currentTarget.style.boxShadow = '3px 3px 10px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)';
    }}>
      {/* Realistic Pushpin effect at top */}
      {/* Pin head (rounded top part) */}
      <div style={{
        position: 'absolute',
        top: '-2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '18px',
        height: '18px',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #a93226 100%)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4), inset -2px -2px 3px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
        zIndex: 11,
        border: '1px solid rgba(139, 0, 0, 0.3)'
      }} />
      {/* Pin needle (metallic point) */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '3px',
        height: '12px',
        background: 'linear-gradient(to right, #bdc3c7 0%, #95a5a6 50%, #7f8c8d 100%)',
        boxShadow: '1px 0 2px rgba(0, 0, 0, 0.4), -1px 0 1px rgba(255, 255, 255, 0.2)',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        zIndex: 10
      }} />
      {/* Trust Score Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: trust.color,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        {trust.emoji} {trust.text}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
        paddingRight: '6rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--primary-dark)'
        }}>
          🏔️ {lakeName}
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: safety.color,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {safety.icon} {thickness}" thick
          {!isMeasured && (
            <span style={{
              fontSize: '0.75rem',
              background: '#f0f0f0',
              color: '#666',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: 500
            }}>
              Observed
            </span>
          )}
        </div>
        
        {surfaceType && (
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            🧊 {surfaceType}
          </div>
        )}

        {location && (
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            📍 {location}
          </div>
        )}

        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          📅 {timeAgo} {reportCount > 1 && `• ${reportCount} reports`}
        </div>

        {quality && quality.length > 0 && (
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem'
          }}>
            {quality.join(', ')}
          </div>
        )}
      </div>

      {/* Age Warning */}
      {ageWarning.message && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: '#FFF3CD',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          color: '#856404',
          marginBottom: '0.75rem',
          borderLeft: '3px solid #F7A93D'
        }}>
          {ageWarning.message}
        </div>
      )}

      <div style={{
        padding: '0.75rem',
        background: 'white',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--foreground)',
        borderLeft: `4px solid ${safety.color}`,
        marginTop: 'auto'
      }}>
        <strong>{safety.activity}</strong> - {safety.status}
      </div>

      {/* Flag Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          alert('Flag feature coming soon! This will allow you to report incorrect information.');
        }}
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'transparent',
          border: '1px dashed #ccc',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          color: '#666',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.borderColor = '#999';
          e.currentTarget.style.color = '#333';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = '#ccc';
          e.currentTarget.style.color = '#666';
        }}
      >
        🚩 Is this report incorrect?
      </button>
    </div>
  );
}
