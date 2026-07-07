// Single source of truth for quote maths.
// Every view (Costs tab, Output previews, print HTML, sidebar totals) must
// derive its numbers from computeQuote() so the formula can never drift
// between what's on screen and what lands on the PDF.

export const DEFAULT_COSTS = {
  labourRate: 85,
  marginPct: 20,
  riskPct: 5,
  plantHire: 0,
  consumables: 0,
  travel: 0,
  materials: [],
};

export function defaultCosts() {
  return { ...DEFAULT_COSTS, materials: [] };
}

// Formula:
//   Margin base  = labour + materials + consumables (cost-of-works)
//   Margin/risk  = % of margin base
//   Pass-through = plant hire + travel, added at cost (no margin)
export function computeQuote(job) {
  const items = job.items || [];
  const costs = { ...DEFAULT_COSTS, ...(job.costs || {}) };
  const { labourRate, marginPct, riskPct, plantHire, consumables, travel } = costs;
  const materials = costs.materials || [];

  const totalHours    = items.reduce((s, it) => s + (it.hours || 0), 0);
  const totalManHours = items.reduce((s, it) => s + (it.hours || 0) * (it.crew || 1), 0);
  const labourCost    = totalManHours * labourRate;
  const materialsCost = materials.reduce((s, m) => s + (m.cost || 0), 0);
  const marginBase    = labourCost + materialsCost + consumables;
  const passThrough   = plantHire + travel;
  const marginAmt     = marginBase * (marginPct / 100);
  const riskAmt       = marginBase * (riskPct / 100);
  const totalQuote    = marginBase + marginAmt + riskAmt + passThrough;
  const costPerMH     = totalManHours > 0 ? totalQuote / totalManHours : 0;

  return {
    labourRate, marginPct, riskPct, plantHire, consumables, travel, materials,
    totalHours, totalManHours, labourCost, materialsCost,
    marginBase, passThrough, marginAmt, riskAmt, totalQuote, costPerMH,
  };
}

// Group items by category, preserving order of first appearance.
export function groupByCategory(items) {
  const categoryOrder = [];
  const grouped = {};
  items.forEach(it => {
    if (!grouped[it.category]) {
      grouped[it.category] = [];
      categoryOrder.push(it.category);
    }
    grouped[it.category].push(it);
  });
  return { categoryOrder, grouped };
}

export function fmt(n) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Collision-proof ids — Date.now() alone can repeat within the same millisecond.
let _idCounter = 0;
export function makeItemId() {
  return `item-${Date.now()}-${++_idCounter}`;
}
export function makeJobId() {
  return `job-${Date.now()}-${++_idCounter}`;
}
