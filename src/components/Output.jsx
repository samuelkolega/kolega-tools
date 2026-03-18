import { useState } from 'react';
import { FLAG_COLORS, CAT_COLORS, TEMPLATES } from '../data/templates.js';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

function fmt(n) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Print HTML builder ───────────────────────────────────────────────────────
// Generates a clean standalone HTML document and opens it in a new window for
// proper PDF printing — no browser UI chrome, correct page breaks, A4 sized.

function buildPrintHTML(job, isInternal) {
  const items      = job.items || [];
  const costs      = job.costs || {};
  const entity     = job.entity || {};
  const template   = TEMPLATES.find(t => t.id === job.type);

  // Numbers
  const labourRate    = costs.labourRate ?? 85;
  const marginPct     = costs.marginPct ?? 20;
  const riskPct       = costs.riskPct ?? 5;
  const plantHire     = costs.plantHire ?? 0;
  const consumables   = costs.consumables ?? 0;
  const travel        = costs.travel ?? 0;
  const materials     = costs.materials ?? [];
  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const totalHours    = items.reduce((s, it) => s + (it.hours || 0), 0);
  const labourCost    = totalManHours * labourRate;
  const materialsCost = materials.reduce((s, m) => s + (m.cost || 0), 0);
  const marginBase    = labourCost + materialsCost + consumables;
  const passThrough   = plantHire + travel;
  const marginAmt     = marginBase * (marginPct / 100);
  const riskAmt       = marginBase * (riskPct / 100);
  const totalQuote    = marginBase + marginAmt + riskAmt + passThrough;

  // Category grouping
  const categoryOrder = [];
  const grouped = {};
  items.forEach(it => {
    if (!grouped[it.category]) {
      grouped[it.category] = [];
      categoryOrder.push(it.category);
    }
    grouped[it.category].push(it);
  });

  // Helpers
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Category colour map (hex strings for print)
  const CAT_HEX = {
    MOBILISATION: { bg: '#E8F4FD', text: '#1B6CA8' },
    STRUCTURE:    { bg: '#EDF7ED', text: '#2E7D32' },
    FRAMING:      { bg: '#FFF8E1', text: '#F57F17' },
    ROOFING:      { bg: '#FCE4EC', text: '#880E4F' },
    FITOUT:       { bg: '#F3E5F5', text: '#6A1B9A' },
    FINISHING:    { bg: '#E0F2F1', text: '#00695C' },
    LOGISTICS:    { bg: '#ECEFF1', text: '#455A64' },
    DEMOLITION:   { bg: '#FBE9E7', text: '#BF360C' },
    EXTERNAL:     { bg: '#E8EAF6', text: '#283593' },
    GENERAL:      { bg: '#F5F5F5', text: '#424242' },
  };

  const FLAG_HEX = {
    CONFIRM:    { bg: '#FFF3CD', text: '#856404' },
    STORMWATER: { bg: '#D1ECF1', text: '#0C5460' },
    TBC:        { bg: '#E2E3E5', text: '#383D41' },
    HEIGHT:     { bg: '#F8D7DA', text: '#721C24' },
    EQUIPMENT:  { bg: '#D4EDDA', text: '#155724' },
    CRITICAL:   { bg: '#F8D7DA', text: '#721C24' },
    'DAY 1':    { bg: '#CCE5FF', text: '#004085' },
  };

  // ── Scope table rows ──
  const scopeColsInternal = `
    <col style="width:90px">
    <col>
    <col style="width:100px">
    <col style="width:52px;text-align:right">
    <col style="width:52px;text-align:right">
    <col style="width:60px;text-align:right">
    <col style="width:70px">
    <col style="width:130px">
  `;
  const scopeColsExternal = `
    <col style="width:90px">
    <col>
    <col style="width:52px;text-align:right">
    <col style="width:52px;text-align:right">
    <col style="width:60px;text-align:right">
  `;

  const scopeHeaderInternal = `
    <tr class="th-row">
      <th>Category</th><th>Item</th><th>Area / Ref</th>
      <th class="num">Hours</th><th class="num">Crew</th><th class="num">Man-Hrs</th>
      <th>Flag</th><th>Notes</th>
    </tr>`;
  const scopeHeaderExternal = `
    <tr class="th-row">
      <th>Category</th><th>Item</th>
      <th class="num">Hours</th><th class="num">Crew</th><th class="num">Man-Hrs</th>
    </tr>`;

  const scopeBodyRows = categoryOrder.map(cat => {
    const catItems = grouped[cat];
    const catColor = CAT_HEX[cat] || CAT_HEX.GENERAL;
    const catMH    = catItems.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
    const catH     = catItems.reduce((s, it) => s + (it.hours || 0), 0);
    const colSpan  = isInternal ? 8 : 5;

    const headerRow = `
      <tr style="background:${catColor.bg}">
        <td colspan="${colSpan}" style="padding:5px 8px;font-size:9.5pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${catColor.text}">
          ${esc(cat)} &nbsp;·&nbsp; <span style="font-family:monospace">${catH.toFixed(1)} hr / ${catMH.toFixed(1)} mh</span>
        </td>
      </tr>`;

    const itemRows = catItems.map(it => {
      const mh = (it.hours || 0) * (it.crew || 1);
      const fc = it.flag ? (FLAG_HEX[it.flag] || {}) : null;
      const flagBadge = fc
        ? `<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:8.5pt;font-weight:700;background:${fc.bg};color:${fc.text}">${esc(it.flag)}</span>`
        : '';

      if (isInternal) {
        return `<tr class="data-row">
          <td style="font-size:9pt;color:#7A8A99"></td>
          <td>${esc(it.item)}</td>
          <td style="color:#7A8A99;font-size:9pt">${esc(it.area)}</td>
          <td class="num mono">${it.hours}</td>
          <td class="num mono">${it.crew}</td>
          <td class="num mono blue">${mh.toFixed(1)}</td>
          <td>${flagBadge}</td>
          <td style="font-size:9pt;color:#7A8A99">${esc(it.notes)}</td>
        </tr>`;
      } else {
        return `<tr class="data-row">
          <td style="font-size:9pt;color:#7A8A99"></td>
          <td>${esc(it.item)}</td>
          <td class="num mono">${it.hours}</td>
          <td class="num mono">${it.crew}</td>
          <td class="num mono blue">${mh.toFixed(1)}</td>
        </tr>`;
      }
    }).join('');

    return headerRow + itemRows;
  }).join('');

  const totalColSpan = isInternal ? 5 : 3;
  const scopeTotalRow = `
    <tr style="background:#F0F6FB;border-top:2pt solid #2E6DA4">
      <td colspan="${totalColSpan}" style="padding:8px 8px;font-weight:700;font-size:10pt;color:#1B3A5C;text-transform:uppercase;letter-spacing:0.05em">Total</td>
      <td class="num mono" style="font-weight:700;font-size:11pt;color:#2E6DA4">${totalManHours.toFixed(1)}</td>
      ${isInternal ? '<td colspan="2"></td>' : ''}
    </tr>`;

  const scopeFootnote = `<div style="margin-top:6px;font-size:9pt;color:#7A8A99">
    ${items.length} line items · ${totalHours.toFixed(1)} elapsed hours · ${totalManHours.toFixed(1)} total man-hours
  </div>`;

  // ── Cost breakdown (internal) ──
  const costRow = (label, value, opts = {}) => {
    const borderTop = opts.total ? 'border-top:2pt solid #1B3A5C;padding-top:10px;margin-top:6px'
                    : opts.sep   ? 'border-top:1pt solid #EEF3F8'
                    : '';
    const labelStyle = `font-size:${opts.total ? '11' : '10'}pt;color:${opts.muted ? '#7A8A99' : '#1A2733'};font-weight:${opts.total ? '700' : '400'}`;
    const valueStyle = `font-family:monospace;font-size:${opts.total ? '13' : '11'}pt;font-weight:${opts.total ? '700' : '500'};color:${opts.total ? '#1B3A5C' : '#1A2733'}`;
    return `<div style="display:flex;justify-content:space-between;padding:5px 0;${borderTop}">
      <span style="${labelStyle}">${esc(label)}</span>
      <span style="${valueStyle}">${esc(value)}</span>
    </div>`;
  };

  const internalCostSection = isInternal ? `
    <div style="margin-top:28px;page-break-inside:avoid">
      <h2 style="font-size:9.5pt;font-weight:700;color:#1B3A5C;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px">
        Cost Breakdown
        <span style="font-size:8.5pt;background:#FFF3CD;color:#856404;padding:2px 8px;border-radius:3px;margin-left:8px;font-weight:600">INTERNAL — DO NOT SHARE</span>
      </h2>
      <div style="border:1pt solid #D8E4EF;border-radius:6px;padding:14px 18px;max-width:380px">
        ${costRow(`Labour — ${totalManHours.toFixed(1)} mh × ${fmt(labourRate)}/hr`, fmt(labourCost))}
        ${materials.map(m => costRow(esc(m.description) || 'Material', fmt(m.cost || 0))).join('')}
        ${costRow('Consumables', fmt(consumables))}
        ${costRow('Margin base', fmt(marginBase), { sep: true })}
        ${costRow(`Margin (${marginPct}%)`, fmt(marginAmt), { muted: true })}
        ${costRow(`Risk buffer (${riskPct}%)`, fmt(riskAmt), { muted: true })}
        ${plantHire > 0 ? costRow('Plant hire (pass-through)', fmt(plantHire), { muted: true }) : ''}
        ${travel > 0 ? costRow('Travel (pass-through)', fmt(travel), { muted: true }) : ''}
        ${costRow('TOTAL QUOTE', fmt(totalQuote), { total: true })}
      </div>
    </div>` : '';

  // ── Flagged items (internal) ──
  const flaggedItems = items.filter(it => it.flag);
  const flaggedSection = (isInternal && flaggedItems.length > 0) ? `
    <div style="margin-top:28px;page-break-inside:avoid">
      <h2 style="font-size:9.5pt;font-weight:700;color:#1B3A5C;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px">
        Attention Items (${flaggedItems.length})
      </h2>
      <div style="border:1pt solid #D8E4EF;border-radius:6px;overflow:hidden">
        ${flaggedItems.map((it, i) => {
          const fc = FLAG_HEX[it.flag] || { bg: '#F8F9FA', text: '#495057' };
          return `<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 12px;${i < flaggedItems.length - 1 ? 'border-bottom:1pt solid #EEF3F8' : ''}">
            <span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:8.5pt;font-weight:700;background:${fc.bg};color:${fc.text};min-width:70px;text-align:center;flex-shrink:0">${esc(it.flag)}</span>
            <div>
              <div style="font-size:10pt;color:#1A2733;font-weight:500">${esc(it.item)}</div>
              ${it.notes ? `<div style="font-size:9pt;color:#7A8A99;margin-top:2px">${esc(it.notes)}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  // ── External total box ──
  const externalSection = !isInternal ? `
    <div style="margin-top:28px;page-break-inside:avoid">
      <div style="border:2pt solid #1B3A5C;border-radius:8px;padding:18px 22px;max-width:320px">
        <div style="font-size:9pt;color:#7A8A99;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Total Quote</div>
        <div style="font-family:monospace;font-size:26pt;font-weight:800;color:#1B3A5C;line-height:1">${fmt(totalQuote)}</div>
        <div style="font-size:9pt;color:#7A8A99;margin-top:8px">Excluding GST · Kolega Construct</div>
      </div>
      <div style="margin-top:28px;padding-top:14px;border-top:1pt solid #EEF3F8;font-size:9pt;color:#7A8A99;line-height:1.6">
        <p style="margin:0 0 4px">This quote is provided by Kolega Construct and is valid for 30 days from the date of issue.</p>
        <p style="margin:0">All prices are exclusive of GST. Scope of works as described above. Variations will be quoted separately.</p>
      </div>
    </div>` : '';

  // ── Notes banner (internal) ──
  const notesBanner = (isInternal && job.notes) ? `
    <div style="margin:10px 0 16px;padding:10px 14px;background:#FFFDF0;border:1pt solid #FFE89A;border-radius:5px;font-size:10pt;color:#856404">
      <strong>Notes:</strong> ${esc(job.notes)}
    </div>` : '';

  // ── Entity / company details ──
  const hasEntity    = entity.preset !== 'none' && entity.name;
  const docType      = entity.docType || 'QUOTE';
  const quoteRef     = entity.quoteRef || '';
  const expiryDate   = entity.expiryDate ? fmtDate(entity.expiryDate) : '';
  const addressLines = (entity.address || '').split('\n').filter(Boolean);

  // ── Full HTML document ──
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(docType)} — ${esc(job.name || 'Quote')}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Arial, sans-serif;
      font-size: 10.5pt;
      color: #1A2733;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, p { margin: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    .th-row th {
      padding: 7px 8px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #7A8A99;
      background: #F7FAFD;
      border-bottom: 2pt solid #D8E4EF;
      text-align: left;
      white-space: nowrap;
    }
    .th-row th.num { text-align: right; }
    .data-row td {
      padding: 7px 8px;
      border-bottom: 1pt solid #EEF3F8;
      vertical-align: middle;
    }
    .num { text-align: right; }
    .mono { font-family: monospace; }
    .blue { color: #2E6DA4; font-weight: 600; }
    table { border: 1pt solid #D8E4EF; border-radius: 6px; overflow: hidden; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- ═══ DOCUMENT HEADER ═══ -->
  <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:2pt solid #1B3A5C;">

    <!-- Top row: company block left, doc type + metadata right -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:14px;">

      <!-- Left: company info -->
      <div>
        ${hasEntity ? `
          <div style="font-size:13pt;font-weight:800;color:#1B3A5C;letter-spacing:0.02em;margin-bottom:4px;">${esc(entity.name)}</div>
          ${entity.abn ? `<div style="font-size:8.5pt;color:#7A8A99;margin-bottom:6px;">ABN&nbsp;&nbsp;${esc(entity.abn)}</div>` : ''}
          ${addressLines.map(l => `<div style="font-size:9pt;color:#555;line-height:1.5;">${esc(l)}</div>`).join('')}
          ${entity.email ? `<div style="font-size:9pt;color:#555;margin-top:4px;">${esc(entity.email)}</div>` : ''}
          ${entity.phone ? `<div style="font-size:9pt;color:#555;">${esc(entity.phone)}</div>` : ''}
        ` : `<div style="font-size:11pt;color:#7A8A99;font-style:italic;">No entity selected</div>`}
      </div>

      <!-- Right: document type + reference metadata -->
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:22pt;font-weight:800;color:#1B3A5C;letter-spacing:0.04em;line-height:1;margin-bottom:10px;">${esc(docType)}</div>
        <table style="border:none;margin-left:auto;font-size:9pt;" cellpadding="0" cellspacing="0">
          ${quoteRef ? `<tr>
            <td style="color:#7A8A99;font-weight:600;padding:2px 10px 2px 0;text-align:right;white-space:nowrap;">Ref No</td>
            <td style="font-family:monospace;color:#1A2733;font-weight:700;">${esc(quoteRef)}</td>
          </tr>` : ''}
          <tr>
            <td style="color:#7A8A99;font-weight:600;padding:2px 10px 2px 0;text-align:right;white-space:nowrap;">Date</td>
            <td style="font-family:monospace;color:#1A2733;">${fmtDate(job.date)}</td>
          </tr>
          ${expiryDate ? `<tr>
            <td style="color:#7A8A99;font-weight:600;padding:2px 10px 2px 0;text-align:right;white-space:nowrap;">Valid Until</td>
            <td style="font-family:monospace;color:#1A2733;">${expiryDate}</td>
          </tr>` : ''}
        </table>
      </div>
    </div>

    <!-- Bottom row: job name + client -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;">
      <div>
        <h1 style="font-size:17pt;color:#1B3A5C;font-weight:800;line-height:1.2;margin-bottom:3px;">${esc(job.name || 'Untitled Job')}</h1>
        <div style="font-size:10pt;color:#7A8A99;">
          ${esc(template?.label || '')}${job.location ? ` · ${esc(job.location)}` : ''}
        </div>
      </div>
      ${job.client ? `<div style="font-size:10pt;color:#7A8A99;text-align:right;flex-shrink:0;">Prepared for<br><strong style="color:#1A2733;font-size:11pt;">${esc(job.client)}</strong></div>` : ''}
    </div>
  </div>

  ${notesBanner}

  <!-- Scope of works -->
  <h2 style="font-size:9.5pt;font-weight:700;color:#1B3A5C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Scope of Works</h2>
  <table>
    <colgroup>${isInternal ? scopeColsInternal : scopeColsExternal}</colgroup>
    <thead>${isInternal ? scopeHeaderInternal : scopeHeaderExternal}</thead>
    <tbody>
      ${scopeBodyRows}
      ${scopeTotalRow}
    </tbody>
  </table>
  ${scopeFootnote}

  ${internalCostSection}
  ${flaggedSection}
  ${externalSection}

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;
}

// ─── React components ─────────────────────────────────────────────────────────

function JobHeader({ job, internal }) {
  const template   = TEMPLATES.find(t => t.id === job.type);
  const entity     = job.entity || {};
  const hasEntity  = entity.preset !== 'none' && entity.name;
  const docType    = entity.docType || 'QUOTE';
  const quoteRef   = entity.quoteRef || '';
  const expiryDate = entity.expiryDate ? fmtDate(entity.expiryDate) : '';
  const addressLines = (entity.address || '').split('\n').filter(Boolean);

  return (
    <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #1B3A5C' }}>

      {/* Top row: company left, doc type + metadata right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '14px', flexWrap: 'wrap' }}>

        {/* Company block */}
        <div>
          {hasEntity ? (
            <>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B3A5C', letterSpacing: '0.02em', marginBottom: '3px' }}>
                {entity.name}
              </div>
              {entity.abn && (
                <div style={{ fontSize: '11px', color: '#7A8A99', marginBottom: '5px' }}>ABN &nbsp;{entity.abn}</div>
              )}
              {addressLines.map((l, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#7A8A99', lineHeight: 1.5 }}>{l}</div>
              ))}
              {entity.email && <div style={{ fontSize: '11px', color: '#7A8A99', marginTop: '3px' }}>{entity.email}</div>}
              {entity.phone && <div style={{ fontSize: '11px', color: '#7A8A99' }}>{entity.phone}</div>}
            </>
          ) : (
            <div style={{ fontSize: '12px', color: '#7A8A99', fontStyle: 'italic' }}>No entity — go to Representing tab to set company details</div>
          )}
        </div>

        {/* Doc type + metadata */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1B3A5C', letterSpacing: '0.04em', marginBottom: '8px' }}>
            {docType}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
            {quoteRef && (
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                <span style={{ color: '#7A8A99', fontWeight: '600' }}>Ref No</span>
                <span style={{ ...mono, color: '#1A2733', fontWeight: '700' }}>{quoteRef}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
              <span style={{ color: '#7A8A99', fontWeight: '600' }}>Date</span>
              <span style={{ ...mono, color: '#1A2733' }}>{fmtDate(job.date)}</span>
            </div>
            {expiryDate && (
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                <span style={{ color: '#7A8A99', fontWeight: '600' }}>Valid Until</span>
                <span style={{ ...mono, color: '#1A2733' }}>{expiryDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: job name + client */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1B3A5C', fontWeight: '800', lineHeight: 1.2 }}>
            {job.name || 'Untitled Job'}
          </h1>
          <div style={{ fontSize: '13px', color: '#7A8A99' }}>
            {template?.label}{job.location ? ` · ${job.location}` : ''}
          </div>
        </div>
        {job.client && (
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#7A8A99' }}>
            Prepared for<br />
            <strong style={{ fontSize: '13px', color: '#1A2733' }}>{job.client}</strong>
          </div>
        )}
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

  const totalHours    = items.reduce((s, it) => s + (it.hours || 0), 0);
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
            const catHours    = catItems.reduce((s, it) => s + (it.hours || 0), 0);
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
  const labourRate  = costs.labourRate ?? 85;
  const marginPct   = costs.marginPct ?? 20;
  const riskPct     = costs.riskPct ?? 5;
  const plantHire   = costs.plantHire ?? 0;
  const consumables = costs.consumables ?? 0;
  const travel      = costs.travel ?? 0;
  const materials   = costs.materials ?? [];

  const totalManHours  = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const labourCost     = totalManHours * labourRate;
  const materialsCost  = materials.reduce((s, m) => s + (m.cost || 0), 0);
  const marginBase     = labourCost + materialsCost + consumables;
  const passThrough    = plantHire + travel;
  const marginAmt      = marginBase * (marginPct / 100);
  const riskAmt        = marginBase * (riskPct / 100);
  const totalQuote     = marginBase + marginAmt + riskAmt + passThrough;

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
        {materials.map(m => row(m.description || 'Material', fmt(m.cost || 0)))}
        {row('Consumables', fmt(consumables))}
        {row('Margin base', fmt(marginBase), { sep: true })}
        {row(`Margin (${marginPct}%)`, fmt(marginAmt), { muted: true })}
        {row(`Risk buffer (${riskPct}%)`, fmt(riskAmt), { muted: true })}
        {plantHire > 0 && row('Plant hire (pass-through)', fmt(plantHire), { muted: true })}
        {travel > 0 && row('Travel (pass-through)', fmt(travel), { muted: true })}
        {row('TOTAL QUOTE', fmt(totalQuote), { total: true })}
      </div>
    </div>
  );
}

function ExternalQuote({ job }) {
  const items = job.items || [];
  const costs = job.costs || {};
  const labourRate  = costs.labourRate ?? 85;
  const marginPct   = costs.marginPct ?? 20;
  const riskPct     = costs.riskPct ?? 5;
  const plantHire   = costs.plantHire ?? 0;
  const consumables = costs.consumables ?? 0;
  const travel      = costs.travel ?? 0;
  const materials   = costs.materials ?? [];

  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const labourCost    = totalManHours * labourRate;
  const materialsCost = materials.reduce((s, m) => s + (m.cost || 0), 0);
  const marginBase    = labourCost + materialsCost + consumables;
  const passThrough   = plantHire + travel;
  const marginAmt     = marginBase * (marginPct / 100);
  const riskAmt       = marginBase * (riskPct / 100);
  const totalQuote    = marginBase + marginAmt + riskAmt + passThrough;

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
  const [mode, setMode] = useState('internal');

  const isInternal = mode === 'internal';
  const items = job.items || [];

  function handlePrint() {
    const html = buildPrintHTML(job, isInternal);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      alert('Pop-up blocked — please allow pop-ups for this page and try again.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

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
          onClick={handlePrint}
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
          ↓ Save as PDF
        </button>
      </div>

      {/* Mode badges */}
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

      {/* Output document (screen preview) */}
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
