import { useState } from 'react';
import { FLAG_COLORS, CAT_COLORS } from '../data/templates.js';

const FLAGS = ['CONFIRM', 'HEIGHT', 'CRITICAL', 'TBC', 'EQUIPMENT', 'STORMWATER', 'DAY 1'];
const UNITS = ['m²', 'lm', 'item', 'hr'];
const CATEGORIES = ['MOBILISATION', 'STRUCTURE', 'FRAMING', 'ROOFING', 'FITOUT', 'FINISHING', 'LOGISTICS', 'DEMOLITION', 'EXTERNAL', 'GENERAL'];

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

export default function ItemRow({ item, editMode, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const manHours = (item.hours || 0) * (item.crew || 1);
  const flagColor = FLAG_COLORS[item.flag] || FLAG_COLORS[null];
  const catColor = CAT_COLORS[item.category] || CAT_COLORS['GENERAL'];

  function set(field, value) {
    onUpdate({ ...item, [field]: value });
  }

  const rowStyle = {
    borderBottom: '1px solid #D8E4EF',
    background: expanded ? '#F7FAFD' : 'white',
    transition: 'background 0.15s',
  };

  const cellBase = {
    padding: '8px 6px',
    verticalAlign: 'middle',
    fontSize: '13px',
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #D8E4EF',
    borderRadius: '4px',
    padding: '3px 6px',
    background: '#F7FAFD',
    fontSize: '13px',
  };

  const numInputStyle = {
    ...inputStyle,
    ...mono,
    width: '60px',
    textAlign: 'right',
  };

  return (
    <>
      <tr style={rowStyle}>
        {/* Category */}
        <td style={{ ...cellBase, width: '110px' }}>
          {editMode ? (
            <select value={item.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, width: '100%' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <span style={{
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.03em',
              background: catColor.bg,
              color: catColor.text,
            }}>{item.category}</span>
          )}
        </td>

        {/* Item name */}
        <td style={{ ...cellBase }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 2px',
                color: '#7A8A99',
                fontSize: '12px',
                lineHeight: 1,
                flexShrink: 0,
              }}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▼' : '▶'}
            </button>
            {editMode ? (
              <input
                value={item.item}
                onChange={e => set('item', e.target.value)}
                style={{ ...inputStyle, minWidth: '140px', flex: 1 }}
              />
            ) : (
              <span style={{ fontWeight: '500' }}>{item.item}</span>
            )}
            {item.flag && (
              <span style={{
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: '600',
                background: flagColor.bg,
                color: flagColor.text,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>{item.flag}</span>
            )}
          </div>
        </td>

        {/* Area */}
        <td style={{ ...cellBase, color: '#7A8A99', fontSize: '12px' }}>
          {editMode ? (
            <input value={item.area || ''} onChange={e => set('area', e.target.value)} style={{ ...inputStyle, width: '90px' }} />
          ) : (
            item.area
          )}
        </td>

        {/* Qty + Unit */}
        <td style={{ ...cellBase, ...mono, textAlign: 'right' }}>
          {editMode ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <input
                type="number"
                min="0"
                value={item.qty || 0}
                onChange={e => set('qty', parseFloat(e.target.value) || 0)}
                style={{ ...numInputStyle, width: '54px' }}
              />
              <select value={item.unit} onChange={e => set('unit', e.target.value)} style={{ ...inputStyle, width: '58px', padding: '3px 2px' }}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          ) : (
            <span>{item.qty} <span style={{ color: '#7A8A99', fontSize: '11px' }}>{item.unit}</span></span>
          )}
        </td>

        {/* Hours */}
        <td style={{ ...cellBase, ...mono, textAlign: 'right' }}>
          {editMode ? (
            <input
              type="number"
              min="0"
              step="0.5"
              value={item.hours}
              onChange={e => set('hours', parseFloat(e.target.value) || 0)}
              style={numInputStyle}
            />
          ) : (
            <span>{item.hours} <span style={{ color: '#7A8A99', fontSize: '11px' }}>hr</span></span>
          )}
        </td>

        {/* Crew */}
        <td style={{ ...cellBase, ...mono, textAlign: 'right' }}>
          {editMode ? (
            <input
              type="number"
              min="1"
              value={item.crew}
              onChange={e => set('crew', parseInt(e.target.value) || 1)}
              style={{ ...numInputStyle, width: '50px' }}
            />
          ) : (
            item.crew
          )}
        </td>

        {/* Man-hrs */}
        <td style={{ ...cellBase, ...mono, textAlign: 'right', color: '#2E6DA4', fontWeight: '600' }}>
          {manHours.toFixed(1)}
        </td>

        {/* Flag */}
        <td style={{ ...cellBase }}>
          {editMode ? (
            <select value={item.flag || ''} onChange={e => set('flag', e.target.value || null)} style={{ ...inputStyle, width: '100px' }}>
              <option value="">— none —</option>
              {FLAGS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          ) : null}
        </td>

        {/* Delete */}
        {editMode && (
          <td style={{ ...cellBase, textAlign: 'center' }}>
            <button
              onClick={() => { if (window.confirm('Delete this item?')) onDelete(item.id); }}
              style={{
                background: '#F8D7DA',
                color: '#721C24',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '12px',
              }}
            >✕</button>
          </td>
        )}
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr style={{ background: '#F0F6FB', borderBottom: '1px solid #D8E4EF' }}>
          <td colSpan={editMode ? 9 : 8} style={{ padding: '8px 16px 12px 32px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7A8A99', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
                {editMode ? (
                  <textarea
                    value={item.notes || ''}
                    onChange={e => set('notes', e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, width: '300px', resize: 'vertical' }}
                  />
                ) : (
                  <span style={{ fontSize: '13px', color: '#495057' }}>{item.notes || '—'}</span>
                )}
              </div>
              {editMode && (
                <div>
                  <div style={{ fontSize: '11px', color: '#7A8A99', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flag</div>
                  <select
                    value={item.flag || ''}
                    onChange={e => set('flag', e.target.value || null)}
                    style={{ ...inputStyle, width: '130px' }}
                  >
                    <option value="">— none —</option>
                    {FLAGS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
              {!editMode && item.flag && (
                <div>
                  <div style={{ fontSize: '11px', color: '#7A8A99', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flag</div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: flagColor.bg,
                    color: flagColor.text,
                  }}>{item.flag}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
