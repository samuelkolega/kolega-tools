import { useState } from 'react';

const mono = { fontFamily: "'DM Mono', 'Courier New', monospace" };

function fmt(n) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

let _matId = 1;
function makeMaterialId() {
  return `mat-${Date.now()}-${_matId++}`;
}

function SliderRow({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A2733' }}>{label}</label>
        <span style={{ ...mono, fontSize: '15px', fontWeight: '700', color: '#2E6DA4' }}>
          {unit === '$' ? fmt(value) : `${value}${unit}`}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ ...mono, fontSize: '11px', color: '#7A8A99', minWidth: '36px' }}>
          {unit === '$' ? `$${min}` : `${min}${unit}`}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#2E6DA4' }}
        />
        <span style={{ ...mono, fontSize: '11px', color: '#7A8A99', minWidth: '40px', textAlign: 'right' }}>
          {unit === '$' ? `$${max}` : `${max}${unit}`}
        </span>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, prefix = '$' }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#7A8A99', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D8E4EF', borderRadius: '6px', background: 'white', overflow: 'hidden' }}>
        <span style={{ padding: '9px 10px', background: '#F7FAFD', borderRight: '1px solid #D8E4EF', color: '#7A8A99', fontSize: '14px', ...mono }}>{prefix}</span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ border: 'none', outline: 'none', padding: '9px 12px', fontSize: '14px', flex: 1, ...mono, background: 'white' }}
        />
      </div>
    </div>
  );
}

export default function Costs({ job, onUpdate }) {
  const costs = job.costs || {};
  const items = job.items || [];

  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatCost, setNewMatCost] = useState('');

  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);

  const labourRate   = costs.labourRate ?? 85;
  const marginPct    = costs.marginPct ?? 20;
  const riskPct      = costs.riskPct ?? 5;
  const plantHire    = costs.plantHire ?? 0;
  const consumables  = costs.consumables ?? 0;
  const travel       = costs.travel ?? 0;
  const materials    = costs.materials ?? [];

  // --- Formula ---
  // Margin base = labour + materials + consumables (cost-of-works)
  // Plant hire & travel are pass-throughs (no margin applied)
  const labourCost    = totalManHours * labourRate;
  const materialsCost = materials.reduce((s, m) => s + (m.cost || 0), 0);
  const marginBase    = labourCost + materialsCost + consumables;
  const passThrough   = plantHire + travel;
  const marginAmt     = marginBase * (marginPct / 100);
  const riskAmt       = marginBase * (riskPct / 100);
  const totalQuote    = marginBase + marginAmt + riskAmt + passThrough;
  const costPerMH     = totalManHours > 0 ? totalQuote / totalManHours : 0;

  function setCost(field, value) {
    onUpdate({ ...job, costs: { ...costs, [field]: value } });
  }

  function handleAddMaterial() {
    const desc = newMatDesc.trim();
    const cost = parseFloat(newMatCost) || 0;
    if (!desc) return;
    const updated = [...materials, { id: makeMaterialId(), description: desc, cost }];
    onUpdate({ ...job, costs: { ...costs, materials: updated } });
    setNewMatDesc('');
    setNewMatCost('');
  }

  function handleUpdateMaterial(id, field, value) {
    const updated = materials.map(m => m.id === id ? { ...m, [field]: value } : m);
    onUpdate({ ...job, costs: { ...costs, materials: updated } });
  }

  function handleDeleteMaterial(id) {
    const updated = materials.filter(m => m.id !== id);
    onUpdate({ ...job, costs: { ...costs, materials: updated } });
  }

  const card = {
    background: 'white',
    border: '1px solid #D8E4EF',
    borderRadius: '10px',
    padding: '20px 24px',
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

  const summaryRow = (label, value, opts = {}) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: opts.total ? '14px 0 0' : '7px 0',
      borderTop: opts.total ? '2px solid #D8E4EF' : opts.separator ? '1px solid #EEF3F8' : 'none',
      marginTop: opts.total ? '8px' : 0,
    }}>
      <span style={{ fontSize: opts.total ? '15px' : '13px', color: opts.muted ? '#7A8A99' : '#1A2733', fontWeight: opts.total ? '700' : '500' }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: opts.total ? '20px' : '14px', fontWeight: opts.total ? '700' : '500', color: opts.total ? '#1B3A5C' : opts.highlight ? '#2E6DA4' : '#1A2733' }}>
        {value}
      </span>
    </div>
  );

  const matInputStyle = {
    border: '1px solid #D8E4EF',
    borderRadius: '4px',
    padding: '7px 10px',
    fontSize: '13px',
    background: '#F7FAFD',
    outline: 'none',
  };

  return (
    <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '16px', alignItems: 'start' }}>

        {/* Left column: controls */}
        <div>

          {/* Labour */}
          <div style={card}>
            <div style={sectionTitle}>Labour</div>
            <div style={{ background: '#EEF3F8', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Total Man-Hours</div>
                <div style={{ ...mono, fontSize: '20px', fontWeight: '700', color: '#1B3A5C' }}>{totalManHours.toFixed(1)} <span style={{ fontSize: '13px', color: '#7A8A99' }}>mh</span></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Labour Cost</div>
                <div style={{ ...mono, fontSize: '20px', fontWeight: '700', color: '#2E6DA4' }}>{fmt(labourCost)}</div>
              </div>
            </div>
            <SliderRow
              label="Charge-out Rate ($/hr)"
              value={labourRate}
              min={50}
              max={200}
              step={5}
              unit="$"
              onChange={v => setCost('labourRate', v)}
            />
          </div>

          {/* Materials */}
          <div style={card}>
            <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Materials</span>
              {materialsCost > 0 && (
                <span style={{ ...mono, fontSize: '14px', fontWeight: '700', color: '#2E6DA4' }}>{fmt(materialsCost)}</span>
              )}
            </div>

            {/* Existing material lines */}
            {materials.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {materials.map((m, i) => (
                  <div key={m.id} style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: i < materials.length - 1 ? '1px solid #EEF3F8' : 'none',
                  }}>
                    <input
                      value={m.description}
                      onChange={e => handleUpdateMaterial(m.id, 'description', e.target.value)}
                      placeholder="Material description"
                      style={{ ...matInputStyle, flex: 1 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D8E4EF', borderRadius: '4px', background: '#F7FAFD', overflow: 'hidden', width: '130px' }}>
                      <span style={{ padding: '7px 8px', fontSize: '13px', color: '#7A8A99', borderRight: '1px solid #D8E4EF', ...mono }}>$</span>
                      <input
                        type="number"
                        min="0"
                        value={m.cost}
                        onChange={e => handleUpdateMaterial(m.id, 'cost', parseFloat(e.target.value) || 0)}
                        style={{ border: 'none', outline: 'none', padding: '7px 8px', fontSize: '13px', width: '80px', ...mono, background: 'transparent' }}
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(m.id)}
                      style={{ background: '#F8D7DA', color: '#721C24', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new material row */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: materials.length > 0 ? '8px' : '0' }}>
              <input
                value={newMatDesc}
                onChange={e => setNewMatDesc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
                placeholder="e.g. Steel columns, Concrete, Bolts…"
                style={{ ...matInputStyle, flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D8E4EF', borderRadius: '4px', background: '#F7FAFD', overflow: 'hidden', width: '130px' }}>
                <span style={{ padding: '7px 8px', fontSize: '13px', color: '#7A8A99', borderRight: '1px solid #D8E4EF', ...mono }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={newMatCost}
                  onChange={e => setNewMatCost(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
                  placeholder="0"
                  style={{ border: 'none', outline: 'none', padding: '7px 8px', fontSize: '13px', width: '80px', ...mono, background: 'transparent' }}
                />
              </div>
              <button
                onClick={handleAddMaterial}
                style={{ background: '#D4EDDA', color: '#155724', border: '1px solid #C3E6CB', borderRadius: '4px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
              >+ Add</button>
            </div>

            {materials.length === 0 && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#7A8A99' }}>
                No materials added. Enter a description and cost above, then press + Add or hit Enter.
              </div>
            )}
          </div>

          {/* Fixed Costs (pass-throughs — no margin applied) */}
          <div style={card}>
            <div style={sectionTitle}>
              Pass-Through Costs
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#7A8A99', marginLeft: '8px', textTransform: 'none', letterSpacing: 0 }}>— plant hire & travel added at cost, no margin applied</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0 20px' }}>
              <NumberInput label="Plant Hire ($)" value={plantHire} onChange={v => setCost('plantHire', v)} />
              <NumberInput label="Travel / Mobilisation ($)" value={travel} onChange={v => setCost('travel', v)} />
            </div>
          </div>

          {/* Consumables — stays in margin base */}
          <div style={card}>
            <div style={sectionTitle}>
              Consumables
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#7A8A99', marginLeft: '8px', textTransform: 'none', letterSpacing: 0 }}>— included in margin base</span>
            </div>
            <div style={{ maxWidth: '220px' }}>
              <NumberInput label="Consumables ($)" value={consumables} onChange={v => setCost('consumables', v)} />
            </div>
          </div>

          {/* Margin & Risk */}
          <div style={{ ...card, border: '1px solid #FFD166', background: '#FFFDF0' }}>
            <div style={{ ...sectionTitle, color: '#856404', borderBottomColor: '#FFE89A' }}>
              Margin & Risk &nbsp;
              <span style={{ fontSize: '11px', background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', letterSpacing: '0.03em' }}>
                INTERNAL ONLY — Not shown in client output
              </span>
            </div>
            <div style={{ background: '#FFF8E1', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', fontSize: '12px', color: '#856404' }}>
              Applied to: Labour + Materials + Consumables&nbsp;
              <span style={{ ...mono, fontWeight: '700' }}>{fmt(marginBase)}</span>
            </div>
            <SliderRow
              label="Margin %"
              value={marginPct}
              min={0}
              max={50}
              step={1}
              unit="%"
              onChange={v => setCost('marginPct', v)}
            />
            <SliderRow
              label="Risk Buffer %"
              value={riskPct}
              min={0}
              max={20}
              step={1}
              unit="%"
              onChange={v => setCost('riskPct', v)}
            />
          </div>
        </div>

        {/* Right column: summary panel */}
        <div style={{ ...card, position: 'sticky', top: '16px' }}>
          <div style={sectionTitle}>Quote Summary</div>

          {summaryRow('Labour cost', fmt(labourCost))}
          {summaryRow('Materials', fmt(materialsCost))}
          {summaryRow('Consumables', fmt(consumables))}
          {summaryRow('Margin base', fmt(marginBase), { separator: true })}
          {summaryRow(`Margin (${marginPct}%)`, fmt(marginAmt), { muted: true })}
          {summaryRow(`Risk buffer (${riskPct}%)`, fmt(riskAmt), { muted: true })}

          {(plantHire > 0 || travel > 0) && (
            <>
              {summaryRow('Plant hire', fmt(plantHire), { muted: true })}
              {summaryRow('Travel', fmt(travel), { muted: true })}
            </>
          )}

          {summaryRow('TOTAL QUOTE', fmt(totalQuote), { total: true, highlight: true })}

          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#EEF3F8', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#7A8A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Effective rate / man-hour
            </div>
            <div style={{ ...mono, fontSize: '16px', fontWeight: '700', color: '#1B3A5C' }}>
              {totalManHours > 0 ? fmt(costPerMH) : '—'} <span style={{ fontSize: '12px', color: '#7A8A99', fontWeight: '400' }}>/mh</span>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#7A8A99', lineHeight: '1.5' }}>
            Based on <strong style={{ color: '#1A2733' }}>{totalManHours.toFixed(1)}</strong> man-hours at <strong style={{ color: '#1A2733' }}>{fmt(labourRate)}/hr</strong> charge-out.
            {materials.length > 0 && <> Plus <strong style={{ color: '#1A2733' }}>{materials.length}</strong> material line{materials.length > 1 ? 's' : ''}.</>}
          </div>
        </div>
      </div>
    </div>
  );
}
