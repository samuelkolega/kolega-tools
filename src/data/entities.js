// Entity presets — who is this document representing?
// Fields can be overridden per-job in the Representing tab.

export const ENTITY_PRESETS = {
  kolega: {
    id: 'kolega',
    label: 'Kolega Construct',
    name: 'Kolega Construct Pty Ltd',
    abn: '57 664 054 675',
    address: 'Unit 2, 12-16 Moore Street\nSomerton Park SA 5044\nAustralia',
    email: 'sam@kolegaconstruct.com.au',
    phone: '+61 419 664 019',
    docType: 'QUOTE',
  },
  allfab: {
    id: 'allfab',
    label: 'Adelaide All Fab',
    name: 'Adelaide All Fab Pty Ltd',
    abn: '',
    address: '',
    email: '',
    phone: '',
    docType: 'ESTIMATE',
  },
  none: {
    id: 'none',
    label: 'None',
    name: '',
    abn: '',
    address: '',
    email: '',
    phone: '',
    docType: 'SCOPE OF WORKS',
  },
  other: {
    id: 'other',
    label: 'Other',
    name: '',
    abn: '',
    address: '',
    email: '',
    phone: '',
    docType: 'QUOTE',
  },
};

export function defaultEntity() {
  const today = new Date();
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + 30);
  return {
    preset: 'kolega',
    docType: ENTITY_PRESETS.kolega.docType,
    name: ENTITY_PRESETS.kolega.name,
    abn: ENTITY_PRESETS.kolega.abn,
    address: ENTITY_PRESETS.kolega.address,
    email: ENTITY_PRESETS.kolega.email,
    phone: ENTITY_PRESETS.kolega.phone,
    quoteRef: autoQuoteRef(),
    expiryDate: expiry.toISOString().slice(0, 10),
  };
}

let _quoteCounter = 1;
export function autoQuoteRef() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `QU-${now.getFullYear().toString().slice(2)}${mm}${dd}-${String(_quoteCounter++).padStart(2, '0')}`;
}
