'use client';

import Link from 'next/link';

interface ReportCardProps {
  lakeName: string;
  thickness: number;
  timeAgo: string;
  location?: string;
  quality?: string[];
  notes?: string;
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
  notes,
  reportCount = 1,
  surfaceType,
  isMeasured = true
}: ReportCardProps) {
  // Check if report is getting old
  const getAgeWarning = (timeText: string) => {
    if (timeText.includes('day') || timeText.includes('days')) {
      const days = Number(timeText.match(/(\d+)\s+days?/)?.[1] ?? 0);
      if (days >= 2) return { message: ' Report aging - verify current conditions', cssClass: 'card-very-faded' };
      if (days >= 1) return { message: ' Conditions may have changed', cssClass: 'card-faded' };
    }
    return { message: null, cssClass: '' };
  };

  const ageWarning = getAgeWarning(timeAgo);

  return (
    <article className={`card report-card ${ageWarning.cssClass}`} style={{
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '240px'
    }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--primary-dark)'
        }}>
           {lakeName}
        </h3>
      </div>

      {notes && <p className="report-observation-notes">{notes}</p>}

      <div style={{
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {thickness}&quot; reported
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
             {surfaceType}
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
             {location}
          </div>
        )}

        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
           {timeAgo} {reportCount > 1 && `• ${reportCount} reports`}
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
          border: '1px solid #F7A93D'
        }}>
          {ageWarning.message}
        </div>
      )}

      <p style={{
        padding: '0.75rem',
        background: '#f5f8fb',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        marginTop: 'auto',
        marginBottom: '0.75rem'
      }}>
        A community report is not a safety assessment. Conditions can vary across the same lake.
      </p>
      <Link href="/safety-guide" style={{
        color: 'var(--primary-dark)',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'underline'
      }}>
        Read ice safety guidance
      </Link>
    </article>
  );
}
