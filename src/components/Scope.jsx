import { useState } from 'react';
import Section from './Section.jsx';
import { FLAG_COLORS } from '../data/templates.js';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

const CATEGORIES = ['MOBILISATION', 'STRUCTURE', 'FRAMING', 'ROOFING', 'FITOUT', 'FINISHING', 'LOGISTICS', 'DEMOLITION', 'EXTERNAL', 'GENERAL'];
const UNITS = ['m²', 'lm', 'item', 'hr'];
const FLAGS_LIST = ['', 'CONFIRM', 'HEIGHT', 'CRITICAL', 'TBC', 'EQUIPMENT', 'STORMWATER', 'DAY 1'];

let _idCounter = 1000;
function makeId() {
  return `item-${Date.now()}-${_idCounter++}`;
}

export default function Scope({ job, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'GENERAL',
    item: '',
    area: '',
    unit: 'item',
    qty: 1,
    hours: 1,
    crew: 2,
    notes: '',
    flag: null,
    includeInLogistics: false,
  });

  const items = job.items || [];

  const totalHours = items.reduce((s, it) => s + (it.hours || 0), 0);
  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const flaggedItems = items.filter(it => it.flag);

  // Group by category, preserving order of first appearance
  const categoryOrder = [];
  const grouped = {};
  items.forEach(it => {
    if (!grouped[it.category]) {
      grouped[it.category] = [];
      categoryOrder.push(it.category);
    }
    grouped[it.category].push(it);
  });

  function handleUpdate(updated) {
    onUpdate({
      ...job,
      items: items.map(it => it.id === updated.id ? updated : it),
    });
  }

  function handleDelete(id) {
    onUpdate({ ...job, items: items.filter(it => it.id !== id) });
  }

  function handleAddItem() {
    if (!newItem.item.trim()) {
      alert('Item description is required.');
      return;
    }
    const item = { ...newItem, id: makeId(), flag: newItem.flag || null };
    onUpdate({ ...job, items: [...items, item] });
    setNewItem({
      category: 'GENERAL',
      item: '',
      area: '',
      unit: 'item',
      qty: 1,
      hours: 1,
      crew: 2,
      notes: '',
      flag: null,
      includeInLogistics: false,
    });
    setShowAddForm(false);
  }

  const totalsBar = {
    display: 'flex',
    gap: '0',
    background: '#1B3A5C',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '16px',
    flexWrap: 'wrap',
  };

  const totalsCell = {
    flex: 1,
    padding: '12px 18px',
    minWidth: '130px',
  };

  const totalsLabel = {
    fontSize: '11px',
    color: '#A0B8D0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  };

  const totalsValue = {
    ...mono,
    fontSize: '22px',
    color: 'white',
    fontWeight: '700',
    lineHeight: 1,
  };

  const totalsUnit = {
    fontSize: '12px',
    color: '#A0B8D0',
    marginLeft: '4px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #D8E4EF',
    fontSize: '13px',
  };

  const thStyle = {
    padding: '8px 6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#7A8A99',
    background: '#F7FAFD',
    borderBottom: '2px solid #D8E4EF',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  const addFormStyle = {
    background: 'white',
    border: '1px solid #2E6DA4',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '12px',
  };

  const inputStyle = {
    border: '1px solid #D8E4EF',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '13px',
    background: '#F7FAFD',
    width: '100%',
  };

  return (
    <div style={{ padding: '16px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Totals bar */}
      <div style={totalsBar}>
        <div style={totalsCell}>
          <div style={totalsLabel}>Elapsed Hours</div>
          <div style={totalsValue}>{totalHours.toFixed(1)}<span style={totalsUnit}>hr</span></div>
        </div>
        <div style={{ ...totalsCell, borderLeft: '1px solid #2E6DA4' }}>
          <div style={totalsLabel}>Total Man-Hours</div>
          <div style={totalsValue}>{totalManHours.toFixed(1)}<span style={totalsUnit}>mh</span></div>
        </div>
        <div style={{ ...totalsCell, borderLeft: '1px solid #2E6DA4' }}>
          <div style={totalsLabel}>Line Items</div>
          <div style={totalsValue}>{items.length}</div>
        </div>
        <div style={{ ...totalsCell, borderLeft: '1px solid #2E6DA4' }}>
          <div style={totalsLabel}>Flagged Items</div>
          <div style={{ ...totalsValue, color: flaggedItems.length > 0 ? '#FFD166' : 'white' }}>
            {flaggedItems.length}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setEditMode(e => !e)}
          style={{
            background: editMode ? '#2E6DA4' : '#EEF3F8',
            color: editMode ? 'white' : '#1B3A5C',
            border: '1px solid #D8E4EF',
            borderRadius: '6px',
            padding: '7px 16px',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          {editMode ? '✓ Done Editing' : '✎ Edit Scope'}
        </button>

        {editMode && (
          <button
            onClick={() => setShowAddForm(s => !s)}
            style={{
              background: showAddForm ? '#EEF3F8' : '#D4EDDA',
              color: showAddForm ? '#1A2733' : '#155724',
              border: '1px solid #D8E4EF',
              borderRadius: '6px',
              padding: '7px 16px',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Item'}
          </button>
        )}

        {flaggedItems.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[...new Set(flaggedItems.map(i => i.flag))].map(flag => {
              const fc = FLAG_COLORS[flag] || FLAG_COLORS[null];
              const count = flaggedItems.filter(i => i.flag === flag).length;
              return (
                <span key={flag} style={{
                  padding: '3px 9px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: fc.bg,
                  color: fc.text,
                }}>
                  {flag} ×{count}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Add item form */}
      {showAddForm && editMode && (
        <div style={addFormStyle}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1B3A5C', marginBottom: '12px' }}>New Line Item</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
              <select value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ITEM DESCRIPTION *</label>
              <input
                value={newItem.item}
                onChange={e => setNewItem(n => ({ ...n, item: e.target.value }))}
                placeholder="e.g. Structural column erection"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>AREA / REF</label>
              <input value={newItem.area} onChange={e => setNewItem(n => ({ ...n, area: e.target.value }))} style={inputStyle} placeholder="As per plan" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>QTY</label>
              <input type="number" min="0" value={newItem.qty} onChange={e => setNewItem(n => ({ ...n, qty: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>UNIT</label>
              <select value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))} style={inputStyle}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>HOURS</label>
              <input type="number" min="0" step="0.5" value={newItem.hours} onChange={e => setNewItem(n => ({ ...n, hours: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CREW</label>
              <input type="number" min="1" value={newItem.crew} onChange={e => setNewItem(n => ({ ...n, crew: parseInt(e.target.value) || 1 }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>FLAG</label>
              <select value={newItem.flag || ''} onChange={e => setNewItem(n => ({ ...n, flag: e.target.value || null }))} style={inputStyle}>
                {FLAGS_LIST.map(f => <option key={f} value={f}>{f || '— none —'}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', display: 'block', marginBottom: '4px' }}>NOTES</label>
              <input value={newItem.notes} onChange={e => setNewItem(n => ({ ...n, notes: e.target.value }))} style={inputStyle} placeholder="Optional notes" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddItem}
              style={{
                background: '#2E6DA4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 20px',
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                background: '#EEF3F8',
                color: '#1A2733',
                border: '1px solid #D8E4EF',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scope table */}
      {items.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #D8E4EF',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#7A8A99',
        }}>
          No scope items. Go to <strong>Job Setup</strong> to load a template, or use Edit mode to add items.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '110px' }}>Category</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Area / Ref</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Crew</th>
                <th style={{ ...thStyle, textAlign: 'right', color: '#2E6DA4' }}>Man-Hrs</th>
                <th style={thStyle}>Flag</th>
                {editMode && <th style={{ ...thStyle, textAlign: 'center' }}></th>}
              </tr>
            </thead>
            <tbody>
              {categoryOrder.map(cat => (
                <Section
                  key={cat}
                  category={cat}
                  items={grouped[cat]}
                  editMode={editMode}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}

              {/* Grand total row */}
              <tr style={{ background: '#F0F6FB', borderTop: '2px solid #2E6DA4' }}>
                <td colSpan={4} style={{ padding: '10px 10px', fontWeight: '700', fontSize: '13px', color: '#1B3A5C', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Grand Total
                </td>
                <td style={{ padding: '10px 6px', ...mono, textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#1B3A5C' }}>
                  {totalHours.toFixed(1)}
                </td>
                <td style={{ padding: '10px 6px', ...mono, textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#1B3A5C' }}>
                  —
                </td>
                <td style={{ padding: '10px 6px', ...mono, textAlign: 'right', fontWeight: '700', fontSize: '15px', color: '#2E6DA4' }}>
                  {totalManHours.toFixed(1)}
                </td>
                <td colSpan={editMode ? 2 : 1}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Flagged items summary */}
      {flaggedItems.length > 0 && (
        <div style={{ marginTop: '20px', background: 'white', border: '1px solid #D8E4EF', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1B3A5C', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Attention Items ({flaggedItems.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {flaggedItems.map(it => {
              const fc = FLAG_COLORS[it.flag] || FLAG_COLORS[null];
              return (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: fc.bg, color: fc.text, minWidth: '80px', textAlign: 'center' }}>
                    {it.flag}
                  </span>
                  <span style={{ color: '#1A2733' }}>{it.item}</span>
                  {it.notes && <span style={{ color: '#7A8A99', fontSize: '12px' }}>— {it.notes}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
