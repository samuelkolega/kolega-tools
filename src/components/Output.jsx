import { useState } from 'react';
import { FLAG_COLORS, CAT_COLORS, TEMPLATES } from '../data/templates.js';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

function fmt(n) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function JobHeader({ job, internal }) {
  const template = TEMPLATES.find(t => t.id === job.type);
  const headerStyle = {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #1B3A5C',
  };
  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            KOLEGA CONSTRUCT
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1B3A5C', fontWeight: '800', lineHeight: 1.2 }}>
            {job.name || 'Untitled Job'}
          </h1>
          <div style={{ fontSize: '13px', color: '#7A8A99' }}>
            {template?.label}
            {job.location ? ` · ${job.location}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', color: '#7A8A99' }}>
          <div style={{ ...mono, fontSize: '14px', color: '#1A2733' }}>{job.date}</div>
          {job.client && <div style={{ marginTop: '4px' }}>{job.client}</div>}
        </div>
      </div>
      {internal && job.notes && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FFFDF0', border: '1px solid #FFE89A', borderRadius: '6px', fontSize: '13px', color: '#856404' }}>
          <strong>Notes:</strong> {job.notes}
        </div>
      )}
    </div>
  );
}

function ScopeTable({ items, internal }) {
  // Group by category
  const categoryOrder = [];
  const grouped = {};
  items.forEach(it => {
    if (!grouped[it.category]) {
      grouped[it.category] = [];
      categoryOrder.push(it.category);
    }
    grouped[it.category].push(it);
  });

  const thStyle = {
    padding: '8px 10px',
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

  const tdStyle = {
    padding: '8px 10px',
    fontSize: '13px',
    borderBottom: '1px solid #EEF3F8',
    verticalAlign: 'middle',
  };

  const totalHours = items.reduce((s, it) => s + (it.hours || 0), 0);
  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);

  return (
    <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Scope of Works
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #D8E4EF', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '100px' }}>Category</th>
            <th style={thStyle}>Item</th>
            {internal && <th style={thStyle}>Area / Ref</th>}
            <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Crew</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Man-Hrs</th>
            {internal && <th style={thStyle}>Flag</th>}
            {internal && <th style={thStyle}>Notes</th>}
          </tr>
        </thead>
        <tbody>
          {categoryOrder.map(cat => {
            const catItems = grouped[cat];
            const catColor = CAT_COLORS[cat] || CAT_COLORS['GENERAL'];
            const catManHours = catItems.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
            const catHours = catItems.reduce((s, it) => s + (it.hours || 0), 0);
            return (
              <>
                <tr key={`cat-${cat}`} style={{ background: catColor.bg }}>
                  <td
                    colSpan={internal ? 8 : 4}
                    style={{ padding: '5px 10px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: catColor.text }}
                  >
                    {cat} &nbsp;·&nbsp; <span style={mono}>{catHours.toFixed(1)} hr / {catManHours.toFixed(1)} mh</span>
                  </td>
                </tr>
                {catItems.map(it => {
                  const manHours = (it.hours || 0) * (it.crew || 1);
                  const flagColor = FLAG_COLORS[it.flag] || FLAG_COLORS[null];
                  return (
                    <tr key={it.id} style={{ background: 'white' }}>
                      <td style={{ ...tdStyle, fontSize: '11px', color: '#7A8A99' }}></td>
                      <td style={tdStyle}>{it.item}</td>
                      {internal && <td style={{ ...tdStyle, color: '#7A8A99', fontSize: '12px' }}>{it.area}</td>}
                      <td style={{ ...tdStyle, ...mono, textAlign: 'right' }}>{it.hours}</td>
                      <td style={{ ...tdStyle, ...mono, textAlign: 'right' }}>{it.crew}</td>
                      <td style={{ ...tdStyle, ...mono, textAlign: 'right', color: '#2E6DA4', fontWeight: '600' }}>{manHours.toFixed(1)}</td>
                      {internal && (
                        <td style={tdStyle}>
                          {it.flag && (
                            <span style={{ padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: '700', background: flagColor.bg, color: flagColor.text }}>
                              {it.flag}
                            </span>
                          )}
                        </td>
                      )}
                      {internal && <td style={{ ...tdStyle, fontSize: '12px', color: '#7A8A99' }}>{it.notes}</td>}
                    </tr>
                  );
                })}
              </>
            );
          })}
          {/* Total row */}
          <tr style={{ background: '#F0F6FB', borderTop: '2px solid #2E6DA4' }}>
            <td colSpan={internal ? 5 : 3} style={{ padding: '10px 10px', fontWeight: '700', fontSize: '13px', color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total
            </td>
            <td style={{ padding: '10px', ...mono, textAlign: 'right', fontWeight: '700', fontSize: '15px', color: '#2E6DA4' }}>
              {totalManHours.toFixed(1)}
            </td>
            {internal && <td colSpan={2}></td>}
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#7A8A99' }}>
        {items.length} line items · {totalHours.toFixed(1)} elapsed hours · {totalManHours.toFixed(1)} total man-hours
      </div>
    </div>
  );
}

function InternalCostSummary({ job }) {
  const items = job.items || [];
  const costs = job.costs || {};
  const labourRate = costs.labourRate ?? 85;
  const marginPct = costs.marginPct ?? 20;
  const riskPct = costs.riskPct ?? 5;
  const plantHire = costs.plantHire ?? 0;
  const consumables = costs.consumables ?? 0;
  const travel = costs.travel ?? 0;

  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const labourCost = totalManHours * labourRate;
  const fixedCosts = plantHire + consumables + travel;
  const subtotal = labourCost + fixedCosts;
  const marginAmt = subtotal * (marginPct / 100);
  const riskAmt = subtotal * (riskPct / 100);
  const totalQuote = subtotal + marginAmt + riskAmt;

  const row = (label, value, opts = {}) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: opts.total ? '12px 0 0' : '7px 0',
      borderTop: opts.total ? '2px solid #1B3A5C' : opts.sep ? '1px solid #EEF3F8' : 'none',
      marginTop: opts.total ? '8px' : 0,
    }}>
      <span style={{ fontSize: opts.total ? '15px' : '13px', color: opts.muted ? '#7A8A99' : '#1A2733', fontWeight: opts.total ? '700' : '400' }}>{label}</span>
      <span style={{ ...mono, fontSize: opts.total ? '20px' : '14px', fontWeight: opts.total ? '700' : '500', color: opts.total ? '#1B3A5C' : '#1A2733' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Cost Breakdown <span style={{ fontSize: '11px', background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>INTERNAL</span>
      </h2>
      <div style={{ border: '1px solid #D8E4EF', borderRadius: '8px', padding: '16px 20px', background: 'white', maxWidth: '420px' }}>
        {row(`Labour — ${totalManHours.toFixed(1)} mh × ${fmt(labourRate)}/hr`, fmt(labourCost))}
        {row('Plant hire', fmt(plantHire))}
        {row('Consumables', fmt(consumables))}
        {row('Travel / mobilisation', fmt(travel))}
        {row('Subtotal', fmt(subtotal), { sep: true })}
        {row(`Margin (${marginPct}%)`, fmt(marginAmt), { muted: true })}
        {row(`Risk buffer (${riskPct}%)`, fmt(riskAmt), { muted: true })}
        {row('TOTAL QUOTE', fmt(totalQuote), { total: true })}
      </div>
    </div>
  );
}

function ExternalQuote({ job }) {
  const items = job.items || [];
  const costs = job.costs || {};
  const labourRate = costs.labourRate ?? 85;
  const marginPct = costs.marginPct ?? 20;
  const riskPct = costs.riskPct ?? 5;
  const plantHire = costs.plantHire ?? 0;
  const consumables = costs.consumables ?? 0;
  const travel = costs.travel ?? 0;

  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const labourCost = totalManHours * labourRate;
  const fixedCosts = plantHire + consumables + travel;
  const subtotal = labourCost + fixedCosts;
  const marginAmt = subtotal * (marginPct / 100);
  const riskAmt = subtotal * (riskPct / 100);
  const totalQuote = subtotal + marginAmt + riskAmt;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ border: '2px solid #1B3A5C', borderRadius: '10px', padding: '20px 24px', maxWidth: '380px', background: 'white' }}>
        <div style={{ fontSize: '12px', color: '#7A8A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Total Quote
        </div>
        <div style={{ ...mono, fontSize: '36px', fontWeight: '800', color: '#1B3A5C', lineHeight: 1 }}>
          {fmt(totalQuote)}
        </div>
        <div style={{ fontSize: '12px', color: '#7A8A99', marginTop: '8px' }}>
          Excluding GST · Kolega Construct
        </div>
      </div>
    </div>
  );
}

function FlaggedSummary({ items }) {
  const flagged = items.filter(it => it.flag);
  if (!flagged.length) return null;
  return (
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Attention Items ({flagged.length})
      </h2>
      <div style={{ border: '1px solid #D8E4EF', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
        {flagged.map((it, i) => {
          const fc = FLAG_COLORS[it.flag] || FLAG_COLORS[null];
          return (
            <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', borderBottom: i < flagged.length - 1 ? '1px solid #EEF3F8' : 'none' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: fc.bg, color: fc.text, whiteSpace: 'nowrap', flexShrink: 0, minWidth: '80px', textAlign: 'center' }}>
                {it.flag}
              </span>
              <div>
                <div style={{ fontSize: '13px', color: '#1A2733', fontWeight: '500' }}>{it.item}</div>
                {it.notes && <div style={{ fontSize: '12px', color: '#7A8A99', marginTop: '2px' }}>{it.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Output({ job }) {
  const [mode, setMode] = useState('internal'); // 'internal' | 'external'

  const isInternal = mode === 'internal';
  const items = job.items || [];

  const toggleStyle = (active) => ({
    padding: '8px 20px',
    fontWeight: '700',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    background: active ? '#1B3A5C' : 'transparent',
    color: active ? 'white' : '#7A8A99',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Controls bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', border: '1px solid #1B3A5C', borderRadius: '8px', overflow: 'hidden' }}>
          <button style={toggleStyle(isInternal)} onClick={() => setMode('internal')}>INTERNAL</button>
          <button style={toggleStyle(!isInternal)} onClick={() => setMode('external')}>EXTERNAL</button>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            background: '#2E6DA4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 20px',
            fontWeight: '700',
            fontSize: '13px',
          }}
        >
          Print to PDF
        </button>
      </div>

      {/* Mode badge (print-visible) */}
      {!isInternal && (
        <div className="no-print" style={{ background: '#EEF3F8', border: '1px solid #D8E4EF', borderRadius: '6px', padding: '8px 14px', marginBottom: '16px', fontSize: '12px', color: '#7A8A99' }}>
          External view — margin, risk, and internal notes are hidden.
        </div>
      )}
      {isInternal && (
        <div className="no-print" style={{ background: '#FFFDF0', border: '1px solid #FFE89A', borderRadius: '6px', padding: '8px 14px', marginBottom: '16px', fontSize: '12px', color: '#856404' }}>
          Internal view — shows all cost details including margin and risk. Do not share with client.
        </div>
      )}

      {/* Output document */}
      <div style={{ background: 'white', border: '1px solid #D8E4EF', borderRadius: '10px', padding: '32px', minHeight: '400px' }}>
        <JobHeader job={job} internal={isInternal} />
        <ScopeTable items={items} internal={isInternal} />
        {isInternal ? (
          <>
            <InternalCostSummary job={job} />
            <FlaggedSummary items={items} />
          </>
        ) : (
          <>
            <ExternalQuote job={job} />
            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #EEF3F8', fontSize: '12px', color: '#7A8A99', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 6px' }}>This quote is provided by Kolega Construct and is valid for 30 days from the date of issue.</p>
              <p style={{ margin: 0 }}>All prices are exclusive of GST. Scope of works as described above. Variations will be quoted separately.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
