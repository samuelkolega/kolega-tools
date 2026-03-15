import { TEMPLATES } from '../data/templates.js';

const labelStyle = {
  display: 'block',
  fontSize: '12px',
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

const fieldStyle = {
  marginBottom: '18px',
};

export default function JobSetup({ job, onUpdate, onResetItems }) {
  function set(field, value) {
    onUpdate({ ...job, [field]: value });
  }

  function handleTypeChange(e) {
    const newType = e.target.value;
    if (newType === job.type) return;
    if (window.confirm('Changing job type will reload template items, replacing the current scope. Continue?')) {
      onResetItems(newType);
    }
  }

  function handleLoadTemplate() {
    if (window.confirm('This will reload the default template items for the current job type, replacing the current scope. Continue?')) {
      onResetItems(job.type);
    }
  }

  const card = {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #D8E4EF',
    padding: '24px',
    maxWidth: '620px',
  };

  const grid2 = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 20px',
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={card}>
        <h2 style={{ margin: '0 0 24px', fontSize: '16px', color: '#1B3A5C', fontWeight: '700', letterSpacing: '0.02em' }}>
          Job Details
        </h2>

        <div style={fieldStyle}>
          <label style={labelStyle}>Job Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Smith Residence — Deck & Verandah"
            value={job.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>

        <div style={{ ...grid2, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              style={inputStyle}
              type="date"
              value={job.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Job Type</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <select
                style={{ ...inputStyle, flex: 1 }}
                value={job.type}
                onChange={handleTypeChange}
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ ...grid2, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>Client Name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Client or company name"
              value={job.client}
              onChange={e => set('client', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Location / Suburb</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Penrith NSW 2750"
              value={job.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            placeholder="Site access notes, special conditions, scope clarifications…"
            value={job.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div style={{ borderTop: '1px solid #D8E4EF', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLoadTemplate}
            style={{
              background: '#EEF3F8',
              border: '1px solid #D8E4EF',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              color: '#1B3A5C',
              fontWeight: '600',
            }}
          >
            ↺ Load Template Defaults
          </button>
          <span style={{ fontSize: '12px', color: '#7A8A99' }}>
            Reloads default scope items for <strong>{TEMPLATES.find(t => t.id === job.type)?.label}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
