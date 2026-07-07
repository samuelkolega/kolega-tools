import { computeQuote, fmt } from '../data/quote.js';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' });
}

const DOC_TYPE_COLORS = {
  'QUOTE':          { bg: '#EDF7ED', text: '#2E7D32' },
  'ESTIMATE':       { bg: '#FFF8E1', text: '#F57F17' },
  'SCOPE OF WORKS': { bg: '#EEF3F8', text: '#1B6CA8' },
  'TAX INVOICE':    { bg: '#F3E5F5', text: '#6A1B9A' },
};

export default function JobSidebar({ jobs, activeJobId, onSelect, onNew, onDelete, onDuplicate, onExport, onImport, onClose, isOpen }) {
  const docTypeColor = (type) => DOC_TYPE_COLORS[type] || DOC_TYPE_COLORS['QUOTE'];

  const footerBtn = {
    flex: 1,
    background: '#EEF3F8',
    color: '#1B3A5C',
    border: '1px solid #D8E4EF',
    borderRadius: '6px',
    padding: '7px 0',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27,58,92,0.35)',
            zIndex: 200,
          }}
        />
      )}

      {/* Sidebar panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '260px',
        background: 'white',
        borderRight: '2px solid #D8E4EF',
        boxShadow: '4px 0 24px rgba(27,58,92,0.15)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Sidebar header */}
        <div style={{
          background: '#1B3A5C',
          padding: '0 14px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{
            ...mono,
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'white',
          }}>
            Jobs
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              width: '28px',
              height: '28px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* New job button */}
        <div style={{ padding: '12px 12px 8px' }}>
          <button
            onClick={() => { onNew(); onClose(); }}
            style={{
              width: '100%',
              background: '#2E6DA4',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> New Job
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#EEF3F8', margin: '0 12px 8px' }} />

        {/* Job count */}
        <div style={{
          padding: '0 14px 6px',
          fontSize: '11px',
          color: '#7A8A99',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </div>

        {/* Job list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
          {jobs.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: '#7A8A99' }}>
              No jobs yet. Hit + New Job to start.
            </div>
          ) : (
            [...jobs].reverse().map(job => {
              const isActive    = job.id === activeJobId;
              const total       = computeQuote(job).totalQuote;
              const entity      = job.entity || {};
              const docType     = entity.docType || 'QUOTE';
              const dtColor     = docTypeColor(docType);
              const entityName  = entity.preset === 'kolega' ? 'Kolega' :
                                  entity.preset === 'allfab' ? 'AllFab' :
                                  entity.preset === 'none'   ? '—' :
                                  entity.name ? entity.name.split(' ')[0] : '—';

              return (
                <div
                  key={job.id}
                  style={{
                    background: isActive ? '#EEF3F8' : 'white',
                    border: isActive ? '2px solid #2E6DA4' : '1px solid #D8E4EF',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    overflow: 'hidden',
                  }}
                  onClick={() => { onSelect(job.id); onClose(); }}
                >
                  <div style={{ padding: '10px 12px' }}>
                    {/* Job name */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: isActive ? '#2E6DA4' : '#1B3A5C',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {job.name || 'Untitled Job'}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#7A8A99', ...mono }}>
                        {fmtDateShort(job.date)}
                      </span>
                      <span style={{ fontSize: '10px', color: '#D8E4EF' }}>·</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: dtColor.bg,
                        color: dtColor.text,
                      }}>
                        {docType}
                      </span>
                      <span style={{ fontSize: '11px', color: '#7A8A99', marginLeft: 'auto' }}>
                        {entityName}
                      </span>
                    </div>

                    {/* Total */}
                    {total > 0 && (
                      <div style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#1B3A5C',
                        ...mono,
                      }}>
                        {fmt(total)}
                      </div>
                    )}
                  </div>

                  {/* Delete button — only on hover, shown via JS state trick */}
                  <div
                    style={{
                      borderTop: '1px solid #EEF3F8',
                      padding: '5px 10px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(job.id);
                        onClose();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        color: '#7A8A99',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        marginRight: 'auto',
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${job.name || 'Untitled Job'}"? This cannot be undone.`)) {
                          onDelete(job.id);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        color: '#B0BEC5',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Backup footer */}
        <div style={{
          borderTop: '1px solid #EEF3F8',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}>
          <button onClick={onExport} style={footerBtn} title="Download all jobs as a JSON backup file">
            ↓ Export
          </button>
          <label style={footerBtn} title="Restore jobs from a backup file">
            ↑ Import
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </>
  );
}
