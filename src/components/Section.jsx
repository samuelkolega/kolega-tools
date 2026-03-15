import { useState } from 'react';
import ItemRow from './ItemRow.jsx';
import { CAT_COLORS } from '../data/templates.js';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

export default function Section({ category, items, editMode, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  const totalHours = items.reduce((s, it) => s + (it.hours || 0), 0);
  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const catColor = CAT_COLORS[category] || CAT_COLORS['GENERAL'];

  return (
    <>
      {/* Section header row */}
      <tr
        style={{ background: catColor.bg, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <td
          colSpan={editMode ? 9 : 8}
          style={{
            padding: '7px 10px',
            borderBottom: '2px solid #D8E4EF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: catColor.text, marginRight: '2px' }}>
              {collapsed ? '▶' : '▼'}
            </span>
            <span style={{
              fontWeight: '700',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: catColor.text,
            }}>{category}</span>
            <span style={{ ...mono, fontSize: '12px', color: catColor.text, opacity: 0.8 }}>
              {totalHours.toFixed(1)} hr elapsed &nbsp;·&nbsp; {totalManHours.toFixed(1)} man-hr
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: catColor.text, opacity: 0.7 }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </td>
      </tr>

      {/* Item rows */}
      {!collapsed && items.map(item => (
        <ItemRow
          key={item.id}
          item={item}
          editMode={editMode}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
