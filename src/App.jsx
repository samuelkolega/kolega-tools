import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { TEMPLATES } from './data/templates.js';
import { defaultEntity } from './data/entities.js';
import { defaultCosts, makeItemId, makeJobId } from './data/quote.js';
import Representing from './components/Representing.jsx';
import JobSetup from './components/JobSetup.jsx';
import Scope from './components/Scope.jsx';
import Costs from './components/Costs.jsx';
import Output from './components/Output.jsx';
import JobSidebar from './components/JobSidebar.jsx';

// Storage keys
const STORAGE_KEY_V2  = 'kolega-scope-jobs-v2';   // new: { jobs: [], activeJobId }
const STORAGE_KEY_V1  = 'kolega-scope-job';        // old: single job — migrate on first load

const TABS = [
  { id: 'representing', label: 'Representing' },
  { id: 'setup',        label: 'Setup' },
  { id: 'scope',        label: 'Scope' },
  { id: 'costs',        label: 'Costs' },
  { id: 'output',       label: 'Output' },
];

function cloneTemplateItems(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  return template.items.map(it => ({ ...it, id: makeItemId() }));
}

function newJob(templateId = TEMPLATES[0].id) {
  return {
    id: makeJobId(),
    name: '',
    date: new Date().toISOString().slice(0, 10),
    type: templateId,
    client: '',
    location: '',
    notes: '',
    entity: defaultEntity(),
    items: cloneTemplateItems(templateId),
    costs: defaultCosts(),
  };
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadFromStorage() {
  // Try new format first
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.jobs && parsed.jobs.length > 0) return parsed;
    }
  } catch { /* ignore */ }

  // Migrate from old single-job format
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (raw) {
      const oldJob = JSON.parse(raw);
      if (!oldJob.entity) oldJob.entity = defaultEntity();
      if (!oldJob.costs) oldJob.costs = defaultCosts();
      return { jobs: [oldJob], activeJobId: oldJob.id };
    }
  } catch { /* ignore */ }

  return null;
}

function initialState() {
  const saved = loadFromStorage();
  if (saved) {
    // Heal a stale pointer — activeJobId must reference a job that exists
    const activeJobId = saved.jobs.some(j => j.id === saved.activeJobId)
      ? saved.activeJobId
      : saved.jobs[saved.jobs.length - 1].id;
    return { jobs: saved.jobs, activeJobId };
  }
  const j = newJob();
  return { jobs: [j], activeJobId: j.id };
}

function saveToStorage(jobs, activeJobId) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ jobs, activeJobId }));
  } catch { /* ignore */ }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [initial] = useState(initialState);
  const [jobs, setJobs] = useState(initial.jobs);
  const [activeJobId, setActiveJobId] = useState(initial.activeJobId);

  const [activeTab,   setActiveTab]   = useState('representing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState('saved');
  const debounceRef = useRef(null);

  // Derived: currently active job object
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0] || newJob();

  // Auto-save with debounce. 'saving' is set by the mutation handlers below,
  // not here — setting state synchronously in an effect forces a double render.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToStorage(jobs, activeJobId);
      setSaveStatus('saved');
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [jobs, activeJobId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleUpdate = useCallback((updatedJob) => {
    setSaveStatus('saving');
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  }, []);

  function handleResetItems(templateId) {
    setSaveStatus('saving');
    setJobs(prev => prev.map(j => j.id === activeJobId
      ? { ...j, type: templateId, items: cloneTemplateItems(templateId) }
      : j
    ));
  }

  function handleNewJob() {
    const j = newJob();
    setSaveStatus('saving');
    setJobs(prev => [...prev, j]);
    setActiveJobId(j.id);
    setActiveTab('representing');
  }

  function handleSelectJob(id) {
    setSaveStatus('saving');
    setActiveJobId(id);
    setActiveTab('setup');
  }

  function handleDeleteJob(id) {
    setSaveStatus('saving');
    const next = jobs.filter(j => j.id !== id);
    if (next.length === 0) {
      const fresh = newJob();
      setJobs([fresh]);
      setActiveJobId(fresh.id);
      return;
    }
    setJobs(next);
    if (id === activeJobId) {
      setActiveJobId(next[next.length - 1].id);
    }
  }

  function handleDuplicateJob(id) {
    const src = jobs.find(j => j.id === id);
    if (!src) return;
    const copy = structuredClone(src);
    copy.id = makeJobId();
    copy.name = src.name ? `${src.name} (copy)` : 'Untitled Job (copy)';
    copy.items = (copy.items || []).map(it => ({ ...it, id: makeItemId() }));
    setSaveStatus('saving');
    setJobs(prev => [...prev, copy]);
    setActiveJobId(copy.id);
  }

  function handleExport() {
    const payload = {
      app: 'kolega-scope',
      version: 2,
      exportedAt: new Date().toISOString(),
      jobs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kolega-scope-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const incoming = Array.isArray(parsed) ? parsed : parsed.jobs;
        if (!Array.isArray(incoming)) throw new Error('no jobs array in file');
        const valid = incoming.filter(j => j && j.id && Array.isArray(j.items));
        if (valid.length === 0) throw new Error('no valid jobs in file');
        setSaveStatus('saving');
        // Same id = restore (overwrite), unseen id = append
        setJobs(prev => {
          const byId = new Map(prev.map(j => [j.id, j]));
          valid.forEach(j => byId.set(j.id, j));
          return [...byId.values()];
        });
        setActiveJobId(valid[valid.length - 1].id);
        alert(`Imported ${valid.length} job${valid.length === 1 ? '' : 's'} from ${file.name}.`);
      } catch (err) {
        alert(`Import failed — ${err.message}. Expected a kolega-scope backup JSON file.`);
      }
    };
    reader.onerror = () => alert('Import failed — could not read the file.');
    reader.readAsText(file);
  }

  // ── Styles ───────────────────────────────────────────────────────────────────

  const primary = '#1B3A5C';
  const blue    = '#2E6DA4';
  const bg      = '#EEF3F8';
  const border  = '#D8E4EF';

  const entityLabel = activeJob.entity?.name || '';

  return (
    <div style={{ minHeight: '100vh', background: bg }}>

      {/* Sidebar */}
      <JobSidebar
        jobs={jobs}
        activeJobId={activeJobId}
        onSelect={handleSelectJob}
        onNew={handleNewJob}
        onDelete={handleDeleteJob}
        onDuplicate={handleDuplicateJob}
        onExport={handleExport}
        onImport={handleImport}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      {/* Header */}
      <header className="no-print" style={{
        background: primary,
        color: 'white',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(27,58,92,0.18)',
      }}>
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: sidebarOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            width: '32px',
            height: '32px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="All jobs"
        >
          ☰
        </button>

        {/* Logo */}
        <div style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'white',
          flexShrink: 0,
        }}>
          Kolega Scope
        </div>

        {/* Entity badge */}
        {entityLabel && (
          <div style={{
            fontSize: '11px',
            background: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: '4px',
            padding: '2px 8px',
            fontWeight: '600',
            flexShrink: 0,
          }}>
            {entityLabel}
          </div>
        )}

        {/* Job name */}
        {activeJob.name && (
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.65)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            — {activeJob.name}
          </div>
        )}

        {/* Spacer */}
        {!activeJob.name && <div style={{ flex: 1 }} />}

        {/* Job count pill */}
        {jobs.length > 1 && (
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'DM Mono', 'Courier New', monospace",
            flexShrink: 0,
          }}>
            {jobs.findIndex(j => j.id === activeJobId) + 1}/{jobs.length}
          </div>
        )}

        {/* Save status */}
        <div style={{
          fontSize: '11px',
          color: saveStatus === 'saving' ? '#FFD166' : 'rgba(255,255,255,0.5)',
          fontFamily: "'DM Mono', 'Courier New', monospace",
          flexShrink: 0,
          transition: 'color 0.3s',
        }}>
          {saveStatus === 'saving' ? '● saving…' : '✓ saved'}
        </div>
      </header>

      {/* Tab bar */}
      <nav className="no-print" style={{
        display: 'flex',
        background: 'white',
        borderBottom: `2px solid ${border}`,
        padding: '0 16px',
        overflowX: 'auto',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? blue : '#7A8A99',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${blue}` : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
              letterSpacing: activeTab === tab.id ? '0.02em' : '0',
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main>
        {activeTab === 'representing' && (
          <Representing job={activeJob} onUpdate={handleUpdate} />
        )}
        {activeTab === 'setup' && (
          <JobSetup job={activeJob} onUpdate={handleUpdate} onResetItems={handleResetItems} />
        )}
        {activeTab === 'scope' && (
          <Scope job={activeJob} onUpdate={handleUpdate} />
        )}
        {activeTab === 'costs' && (
          <Costs job={activeJob} onUpdate={handleUpdate} />
        )}
        {activeTab === 'output' && (
          <Output job={activeJob} />
        )}
      </main>
    </div>
  );
}
