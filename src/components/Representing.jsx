import { ENTITY_PRESETS } from '../data/entities.js';

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#7A8A99',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #D8E4EF',
  borderRadius: '6px',
  padding: '9px 12px',
  fontSize: '14px',
  background: 'white',
  color: '#1A2733',
  outline: 'none',
};

const fieldStyle = { marginBottom: '16px' };

const DOC_TYPES = ['QUOTE', 'ESTIMATE', 'SCOPE OF WORKS', 'TAX INVOICE'];

const PRESET_ORDER = ['kolega', 'allfab', 'none', 'other'];

const PRESET_ICONS = {
  kolega: '🏗️',
  allfab: '🔩',
  none:   '—',
  other:  '✏️',
};

const PRESET_DESC = {
  kolega: 'Your company — formal quotes to clients',
  allfab: 'For Mick & Damian — internal estimates',
  none:   'No entity branding on the document',
  other:  'Custom company name & details',
};

export default function Representing({ job, onUpdate }) {
  const entity = job.entity || {};

  function setEntity(field, value) {
    onUpdate({ ...job, entity: { ...entity, [field]: value } });
  }

  function loadPreset(presetId) {
    const preset = ENTITY_PRESETS[presetId];
    if (!preset) return;
    onUpdate({
      ...job,
      entity: {
        ...entity,
        preset: presetId,
        docType: preset.docType,
        name: preset.name,
        abn: preset.abn,
        address: preset.address,
        email: preset.email,
        phone: preset.phone,
      },
    });
  }

  const currentPreset = entity.preset || 'kolega';

  const card = {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #D8E4EF',
    padding: '24px',
    marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1B3A5C',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #EEF3F8',
  };

  const presetCard = (presetId) => {
    const isActive = currentPreset === presetId;
    return (
      <button
        key={presetId}
        onClick={() => loadPreset(presetId)}
        style={{
          background: isActive ? '#EEF3F8' : 'white',
          border: isActive ? '2px solid #2E6DA4' : '2px solid #D8E4EF',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '18px' }}>{PRESET_ICONS[presetId]}</span>
          <span style={{
            fontSize: '14px',
            fontWeight: '700',
            color: isActive ? '#2E6DA4' : '#1B3A5C',
          }}>
            {ENTITY_PRESETS[presetId].label}
          </span>
          {isActive && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '11px',
              background: '#2E6DA4',
              color: 'white',
              borderRadius: '4px',
              padding: '1px 7px',
              fontWeight: '600',
            }}>ACTIVE</span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: '#7A8A99', lineHeight: 1.4 }}>
          {PRESET_DESC[presetId]}
        </div>
      </button>
    );
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Preset picker */}
      <div style={card}>
        <div style={sectionTitle}>Representing</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '4px' }}>
          {PRESET_ORDER.map(presetCard)}
        </div>
      </div>

      {/* Entity fields */}
      {currentPreset !== 'none' && (
        <div style={card}>
          <div style={sectionTitle}>
            Company Details
            {currentPreset !== 'other' && (
              <span style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '500', textTransform: 'none', letterSpacing: 0, marginLeft: '8px' }}>
                — pre-filled, edit if needed
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ gridColumn: 'span 2', ...fieldStyle }}>
              <label style={labelStyle}>Company / Trading Name</label>
              <input
                style={inputStyle}
                value={entity.name || ''}
                onChange={e => setEntity('name', e.target.value)}
                placeholder="e.g. Kolega Construct Pty Ltd"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>ABN</label>
              <input
                style={inputStyle}
                value={entity.abn || ''}
                onChange={e => setEntity('abn', e.target.value)}
                placeholder="xx xxx xxx xxx"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                value={entity.phone || ''}
                onChange={e => setEntity('phone', e.target.value)}
                placeholder="+61 4xx xxx xxx"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                value={entity.email || ''}
                onChange={e => setEntity('email', e.target.value)}
                placeholder="you@company.com.au"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Document Type</label>
              <select
                style={inputStyle}
                value={entity.docType || 'QUOTE'}
                onChange={e => setEntity('docType', e.target.value)}
              >
                {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', ...fieldStyle }}>
              <label style={labelStyle}>Address</label>
              <textarea
                style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
                value={entity.address || ''}
                onChange={e => setEntity('address', e.target.value)}
                placeholder="Street, Suburb State Postcode"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quote metadata */}
      <div style={card}>
        <div style={sectionTitle}>Document Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Quote / Ref Number</label>
            <input
              style={inputStyle}
              value={entity.quoteRef || ''}
              onChange={e => setEntity('quoteRef', e.target.value)}
              placeholder="QU-0001"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Valid Until (Expiry)</label>
            <input
              style={inputStyle}
              type="date"
              value={entity.expiryDate || ''}
              onChange={e => setEntity('expiryDate', e.target.value)}
            />
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#7A8A99' }}>
          These appear in the document header. Quote number and expiry are visible to the client on external output.
        </div>
      </div>

    </div>
  );
}
