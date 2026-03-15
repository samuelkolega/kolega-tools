export const FLAG_COLORS = {
  CONFIRM:    { bg: '#FFF3CD', text: '#856404' },
  STORMWATER: { bg: '#D1ECF1', text: '#0C5460' },
  TBC:        { bg: '#E2E3E5', text: '#383D41' },
  HEIGHT:     { bg: '#F8D7DA', text: '#721C24' },
  EQUIPMENT:  { bg: '#D4EDDA', text: '#155724' },
  CRITICAL:   { bg: '#F8D7DA', text: '#721C24' },
  'DAY 1':    { bg: '#CCE5FF', text: '#004085' },
  null:       { bg: '#F8F9FA', text: '#495057' },
};

export const CAT_COLORS = {
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

let _idCounter = 1;
function makeId() {
  return `item-${Date.now()}-${_idCounter++}`;
}

function item(category, name, area, unit, qty, hours, crew, notes = '', flag = null) {
  return {
    id: makeId(),
    category,
    item: name,
    area,
    unit,
    qty,
    hours,
    crew,
    notes,
    flag,
    includeInLogistics: false,
  };
}

export const TEMPLATES = [
  {
    id: 'structural-steel',
    label: 'Structural Steel Install',
    description: 'Steel column erection, beam installation, connections and bracing.',
    items: [
      item('MOBILISATION', 'Mobilisation & site setup',     'Site',          'item', 1,  4,  2, 'Truck, crane, safety setup'),
      item('STRUCTURE',    'Steel column erection',          'As per drawings','item', 8,  16, 3, 'Plumb and brace each column', 'HEIGHT'),
      item('STRUCTURE',    'Primary beam installation',      'As per drawings','item', 12, 20, 3, 'Crane lift and bolt-up', 'HEIGHT'),
      item('STRUCTURE',    'Secondary beam / rafter install','As per drawings','lm',   40, 14, 3),
      item('STRUCTURE',    'Connections & high-tensile bolting','All joints', 'item', 1,  8,  2, 'Torque to spec'),
      item('STRUCTURE',    'Purlins & girts',                'Roof & wall',   'lm',   80, 10, 2),
      item('STRUCTURE',    'Wind bracing installation',      'As per drawings','item', 1,  6,  2, null, 'CONFIRM'),
      item('GENERAL',     'Final inspection & de-mob',       'Site',          'item', 1,  4,  2),
    ],
  },
  {
    id: 'first-fix',
    label: 'Carpentry — First Fix',
    description: 'Wall framing, floor framing, roof framing, trusses and bracing.',
    items: [
      item('MOBILISATION', 'Mobilisation & layout',         'Site',          'item', 1,  3,  2),
      item('FRAMING',     'Floor framing — bearers & joists','As per plan',   'm²',   120, 16, 2),
      item('FRAMING',     'Wall framing — external walls',  'As per plan',   'lm',   90,  20, 2),
      item('FRAMING',     'Wall framing — internal walls',  'As per plan',   'lm',   60,  12, 2),
      item('FRAMING',     'Roof framing / trusses',         'As per plan',   'm²',   100, 18, 3, 'Crane lift if trusses', 'EQUIPMENT'),
      item('FRAMING',     'Roof bracing & strutting',       'As per plan',   'item', 1,   6,  2),
      item('FRAMING',     'Noggins & blocking',             'All walls',     'item', 1,   8,  2),
      item('FRAMING',     'Window & door rough-ins',        'As per schedule','item', 1,  10, 2, null, 'CONFIRM'),
    ],
  },
  {
    id: 'second-fix',
    label: 'Carpentry — Second Fix',
    description: 'Internal doors, architraves, skirting, cabinetry and hardware.',
    items: [
      item('MOBILISATION', 'Mobilisation',                  'Site',          'item', 1,  1,  1),
      item('FITOUT',      'Internal door hanging',          'As per schedule','item', 8,  8,  1),
      item('FITOUT',      'Architraves',                    'All doors/windows','lm', 120, 8, 1),
      item('FITOUT',      'Skirting boards',                'All rooms',     'lm',   90,  6,  1),
      item('FITOUT',      'Shelving installation',          'Linen/pantry',  'item', 4,  4,  1),
      item('FITOUT',      'Cabinetry install',              'Kitchen/bath',  'item', 1,  12, 2, 'Bench-tops separate', 'CONFIRM'),
      item('FITOUT',      'Door & cabinet hardware',        'All items',     'item', 1,  4,  1),
      item('FINISHING',   'Final trim & touch-up',          'Site',          'item', 1,  3,  1),
    ],
  },
  {
    id: 'supply-install',
    label: 'Supply & Install',
    description: 'Material procurement, delivery, installation and site cleanup.',
    items: [
      item('MOBILISATION', 'Mobilisation & site setup',     'Site',          'item', 1,  3,  2),
      item('LOGISTICS',   'Material procurement',           'As per schedule','item', 1,  4,  1, 'Supplier lead times to be confirmed', 'TBC'),
      item('LOGISTICS',   'Delivery & unloading',           'Site',          'item', 1,  4,  2, 'Forklift or crane may be required', 'EQUIPMENT'),
      item('GENERAL',     'Installation',                   'As per drawings','item', 1,  24, 2, null, 'CONFIRM'),
      item('GENERAL',     'Connections & commissioning',    'All items',     'item', 1,  4,  2),
      item('GENERAL',     'Site cleanup & de-mob',          'Site',          'item', 1,  2,  2),
    ],
  },
  {
    id: 'install-only',
    label: 'Install Only',
    description: 'Receive materials on site, install, connect and clean up.',
    items: [
      item('MOBILISATION', 'Mobilisation & site setup',     'Site',          'item', 1,  2,  2),
      item('LOGISTICS',   'Receive & check materials on site','Site',         'item', 1,  2,  1, 'Client supplies — check for damage'),
      item('GENERAL',     'Installation',                   'As per scope',  'item', 1,  20, 2, null, 'CONFIRM'),
      item('GENERAL',     'Connections & commissioning',    'All items',     'item', 1,  4,  2),
      item('GENERAL',     'Site cleanup & de-mob',          'Site',          'item', 1,  2,  2),
    ],
  },
  {
    id: 'renovations',
    label: 'Renovations',
    description: 'Strip out, structural alterations, framing, fit-out and finishing.',
    items: [
      item('MOBILISATION', 'Mobilisation & protection',     'Site',          'item', 1,  4,  2, 'Dust sheets, floor protection'),
      item('DEMOLITION',  'Strip out & demolition',         'As per plan',   'm²',   30,  12, 2, 'Check for asbestos', 'CRITICAL'),
      item('DEMOLITION',  'Disposal of waste',              'Skip bin',      'item', 2,  4,  2),
      item('STRUCTURE',   'Structural alterations',         'As per engineer','item', 1,  16, 2, 'Engineer certification required', 'CRITICAL'),
      item('FRAMING',     'New framing works',              'As per plan',   'm²',   40,  14, 2),
      item('FITOUT',      'Internal fit-out',               'As per plan',   'item', 1,  20, 2, null, 'CONFIRM'),
      item('FINISHING',   'Finishing & painting prep',      'All areas',     'm²',   80,  8,  1),
      item('GENERAL',     'Final clean & de-mob',           'Site',          'item', 1,  3,  2),
    ],
  },
  {
    id: 'verandahs',
    label: 'Verandahs',
    description: 'Footings, posts, beams, roof framing, gutters and decking.',
    items: [
      item('MOBILISATION', 'Mobilisation & set-out',        'Site',          'item', 1,  3,  2),
      item('STRUCTURE',   'Footings & posts',               'As per plan',   'item', 6,  10, 2, 'Concrete footings — check DA', 'CONFIRM'),
      item('STRUCTURE',   'Beam installation',              'As per plan',   'lm',   20,  6,  2),
      item('ROOFING',     'Roof framing',                   'As per plan',   'm²',   30,  8,  2),
      item('ROOFING',     'Roofing — sheet or tile',        'As per plan',   'm²',   30,  10, 2, null, 'CONFIRM'),
      item('EXTERNAL',    'Gutters & downpipes',            'Perimeter',     'lm',   15,  4,  1, null, 'STORMWATER'),
      item('EXTERNAL',    'Decking boards',                 'As per plan',   'm²',   25,  10, 2),
      item('EXTERNAL',    'Balustrade installation',        'As per plan',   'lm',   12,  6,  2, null, 'CONFIRM'),
      item('GENERAL',     'Final fix & de-mob',             'Site',          'item', 1,  2,  2),
    ],
  },
  {
    id: 'decks',
    label: 'Decks',
    description: 'Set out, footings, bearers, joists, decking, stairs and balustrade.',
    items: [
      item('MOBILISATION', 'Mobilisation & set-out',        'Site',          'item', 1,  2,  2, 'String lines, levels'),
      item('STRUCTURE',   'Footings & stumps',              'As per plan',   'item', 8,  8,  2, 'Concrete footings — check DA', 'CONFIRM'),
      item('STRUCTURE',   'Posts',                          'As per plan',   'item', 8,  4,  2),
      item('STRUCTURE',   'Bearers',                        'As per plan',   'lm',   30,  6,  2),
      item('STRUCTURE',   'Joists',                         'As per plan',   'lm',   60,  8,  2),
      item('EXTERNAL',    'Decking boards',                 'As per plan',   'm²',   40,  14, 2),
      item('EXTERNAL',    'Stairs',                         'As required',   'item', 1,  6,  2, null, 'CONFIRM'),
      item('EXTERNAL',    'Balustrade installation',        'As per plan',   'lm',   14,  6,  2, null, 'CONFIRM'),
      item('FINISHING',   'Finishing, oiling or sanding',   'All decking',   'm²',   40,  4,  1),
      item('GENERAL',     'Final fix & de-mob',             'Site',          'item', 1,  2,  2),
    ],
  },
];

export default TEMPLATES;
