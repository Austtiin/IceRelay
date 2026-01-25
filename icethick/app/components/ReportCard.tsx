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
  // 5-tier safety scale
  const getSafetyInfo = (inches: number) => {
    if (inches < 4) {
      return {
        status: 'No foot traffic',
        icon: '🔴',
        className: 'badge-danger',
        color: '#FE5F55',
        activity: 'STAY OFF'
      };
    } else if (inches < 7) {
      return {
        status: 'Foot only',
        icon: '🟠',
        className: 'badge-warning',
        color: '#FF8C42',
        activity: 'Walking only'
      };
    } else if (inches < 10) {
      return {
        status: 'Snowmobile',
        icon: '🟡',
        className: 'badge-caution',
        color: '#F7A93D',
        activity: 'Light vehicles'
      };
    } else if (inches < 12) {
      return {
        status: 'ATV safe',
        icon: '🟢',
        className: 'badge-safe',
        color: '#577399',
        activity: 'ATVs OK'
      };
    } else {
      return {
        status: 'Truck (risky)',
        icon: '🔵',
        className: 'badge-truck',
        color: '#4A90E2',
        activity: 'Heavy vehicles'
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
    <div className={`card ${ageWarning.cssClass}`} style={{ marginBottom: '1rem', position: 'relative' }}>
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
        borderLeft: `4px solid ${safety.color}`
      }}>
        <strong>{safety.activity}</strong> - {safety.status}
      </div>
    </div>
  );
}
