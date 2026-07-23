const CUE_IMPORT_TARGET_FIELDS = [
  { key: 'number',      label: 'Cue Number',   keywords: ['number', 'cue number', 'cue #', 'cue', 'lq', 'sq'] },
  { key: 'type',        label: 'Type',         keywords: ['type', 'cue type', 'department'] },
  { key: 'actId',       label: 'Act',          keywords: ['act'] },
  { key: 'sceneId',     label: 'Scene',        keywords: ['scene', 'scene name'] },
  { key: 'page',        label: 'Page',         keywords: ['page', 'pg', 'pgs', 'page number', 'pg #'] },
  { key: 'triggerLine', label: 'Trigger Line', keywords: ['trigger', 'trigger line', 'cue line', 'calling line'] },
  { key: 'description', label: 'Description',  keywords: ['description', 'desc', 'action'] },
  { key: 'notes',       label: 'Notes',        keywords: ['notes', 'note', 'comments'] },
  { key: 'duration',    label: 'Duration',     keywords: ['duration', 'seconds', 'length'] },
];

const CUE_IMPORT_SKIP_FIELD = { key: 'skip', label: "Don't import" };
const CUE_IMPORT_MAPPING_OPTIONS = [CUE_IMPORT_SKIP_FIELD, ...CUE_IMPORT_TARGET_FIELDS];

const normalizeCueImportKey = (str) => (str || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

const autoDetectCueField = (header) => {
  const normHeader = normalizeCueImportKey(header);
  if (!normHeader) return 'skip';

  for (const field of CUE_IMPORT_TARGET_FIELDS) {
    for (const kw of field.keywords) {
      if (normalizeCueImportKey(kw) === normHeader) return field.key;
    }
  }
  for (const field of CUE_IMPORT_TARGET_FIELDS) {
    for (const kw of field.keywords) {
      if (normHeader.includes(normalizeCueImportKey(kw))) return field.key;
    }
  }
  return 'skip';
};

const normalizeCueImportType = (value) => {
  const v = (value || '').toString().toLowerCase();
  if (v.includes('light')) return 'lighting';
  if (v.includes('sound')) return 'sound';
  if (v.includes('fly')) return 'fly';
  if (v.includes('follow')) return 'follow_spot';
  if (v.includes('spot')) return 'spot';
  if (v.includes('deck')) return 'deck';
  if (v.includes('entrance') || v.includes('ent')) return 'entrance';
  if (v.includes('intermission')) return 'intermission';
  return 'other';
};

const ROMAN_TO_NUM = { i: 1, ii: 2, iii: 3, iv: 4, v: 5 };
const WORD_TO_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const SPECIAL_ACT_ALIASES = {
  'preshow': 'Pre-Show', 'pre-show': 'Pre-Show', 'pre show': 'Pre-Show',
  'prologue': 'Prologue',
  'intermission': 'Intermission',
  'entracte': "Entr'acte", "entr'acte": "Entr'acte", 'entr acte': "Entr'acte",
  'epilogue': 'Epilogue',
  'postshow': 'Post-Show', 'post-show': 'Post-Show', 'post show': 'Post-Show',
};

const normalizeActText = (str) => (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

// Extracts a 1-5 position from an act label if it has one (digit, roman numeral, or word), else null
const parseActPosition = (str) => {
  const norm = normalizeActText(str);
  if (!norm) return null;
  const digitMatch = norm.match(/\d+/);
  if (digitMatch) {
    const n = parseInt(digitMatch[0], 10);
    return (n >= 1 && n <= 5) ? n : null;
  }
  const tokens = norm.replace(/^act\s*/, '').trim();
  if (ROMAN_TO_NUM[tokens] != null) return ROMAN_TO_NUM[tokens];
  if (WORD_TO_NUM[tokens] != null) return WORD_TO_NUM[tokens];
  return null;
};

// Resolves a raw uploaded Act value to an actual act object from production.acts, or null
const matchActToProduction = (rawActValue, acts) => {
  const norm = normalizeActText(rawActValue);
  if (!norm || !acts || acts.length === 0) return null;

  // 1. Exact case-insensitive match against actual act names
  const exact = acts.find(a => normalizeActText(a.name) === norm);
  if (exact) return exact;

  // 2. Special named act aliases (Pre-Show, Prologue, Intermission, Entr'acte, Epilogue, Post-Show)
  if (SPECIAL_ACT_ALIASES[norm]) {
    const canonical = SPECIAL_ACT_ALIASES[norm];
    const bySpecial = acts.find(a => normalizeActText(a.name) === normalizeActText(canonical));
    if (bySpecial) return bySpecial;
  }

  // 3. Positional match (digit / roman / word all resolve to the same 1-5 position)
  const position = parseActPosition(rawActValue);
  if (position != null) {
    const byPosition = acts.find(a => parseActPosition(a.name) === position);
    if (byPosition) return byPosition;
  }

  return null;
};

// Resolves a raw uploaded Scene value to an actual scene name within the matched act, or null
const matchSceneToAct = (rawSceneValue, matchedAct) => {
  if (!matchedAct || !matchedAct.scenes || matchedAct.scenes.length === 0) return null;
  const norm = normalizeActText(rawSceneValue);
  if (!norm) return null;

  // 1. Exact case-insensitive match against actual scene names in this act
  const exact = matchedAct.scenes.find(s => normalizeActText(s.name) === norm);
  if (exact) return exact.name;

  // 2. Positional match — extract a leading number and use it as a 1-based index into this act's scenes
  const numMatch = norm.match(/\d+/);
  if (numMatch) {
    const idx = parseInt(numMatch[0], 10) - 1;
    if (matchedAct.scenes[idx]) return matchedAct.scenes[idx].name;
  }

  return null;
};

const CUE_IMPORT_TEMPLATE_HEADERS = ['Cue Number', 'Type', 'Act', 'Scene', 'Page', 'Trigger Line', 'Description', 'Notes', 'Duration (seconds)'];

const CUE_IMPORT_TEMPLATE_ROWS = [
  ['LQ 12', 'Lighting', 'Act One', 'Scene 2', '14', 'As Cinderella exits stage left', 'Fade to warm wash', '', '3'],
  ['SQ 5', 'Sound', 'Act I', 'Scene 1', '3', 'Door slams offstage', 'Thunder crash effect', '', ''],
  ['FLY 2', 'Fly', 'Prologue', 'Scene 1', '1', 'House lights dim', 'Drop in the forest backdrop', 'Check counterweight before every show', ''],
  ['ENT 8', 'Entrance', 'Act Two', 'Scene 4', '22-25', "Wolf's howl fades", 'Wolf enters from house right', '', ''],
  ['SQ 14', 'Sound', 'Intermission', '', '26', '', '15-minute intermission music', '', '900'],
];

const generateCueImportTemplate = () => {
  const Papa = window.Papa;
  if (Papa && typeof Papa.unparse === 'function') {
    return Papa.unparse({ fields: CUE_IMPORT_TEMPLATE_HEADERS, data: CUE_IMPORT_TEMPLATE_ROWS });
  }
  const escapeCsvValue = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [CUE_IMPORT_TEMPLATE_HEADERS, ...CUE_IMPORT_TEMPLATE_ROWS]
    .map(row => row.map(escapeCsvValue).join(','))
    .join('\r\n');
};

function CueSheetImportModal({ production, isOpen, onClose, onImportComplete }) {
  const { useState, useRef } = React;

  const [step, setStep] = useState('upload');
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const resetState = () => {
    setStep('upload');
    setError(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleDownloadTemplate = () => {
    const csv = generateCueImportTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banquo-cue-sheet-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const Papa = window.Papa;
      if (!Papa) {
        reject(new Error('PapaParse library not loaded'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => (h || '').trim()
          });
          resolve(parsed.data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const XLSX = window.XLSX;
      if (!XLSX) {
        reject(new Error('SheetJS (XLSX) library not loaded'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      let parsed;
      if (file.name.toLowerCase().endsWith('.csv')) {
        parsed = await parseCSV(file);
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
        parsed = await parseExcel(file);
      } else {
        throw new Error('Unsupported file type. Please use a CSV or Excel file.');
      }

      if (!parsed || parsed.length === 0) {
        throw new Error('File is empty or could not be parsed.');
      }

      const detectedHeaders = Object.keys(parsed[0]);
      const initialMapping = {};
      detectedHeaders.forEach(h => { initialMapping[h] = autoDetectCueField(h); });

      setHeaders(detectedHeaders);
      setRows(parsed);
      setMapping(initialMapping);
      setStep('mapping');
    } catch (err) {
      console.error('Cue import parse error:', err);
      setError(err.message || 'Failed to parse file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleMappingChange = (header, value) => {
    setMapping(prev => ({ ...prev, [header]: value }));
  };

  const hasTypeMapping = Object.values(mapping).includes('type');

  const buildCueFromRow = (row) => {
    const cue = {};
    headers.forEach(h => {
      const target = mapping[h];
      if (!target || target === 'skip') return;
      const raw = row[h];
      if (target === 'duration') {
        const n = parseInt(raw, 10);
        if (!isNaN(n)) cue.duration = n;
      } else if (target === 'type') {
        cue.type = normalizeCueImportType(raw);
      } else {
        cue[target] = (raw === undefined || raw === null) ? '' : String(raw).trim();
      }
    });
    if (!hasTypeMapping) cue.type = 'other';

    let matchedAct = null;
    if (cue.actId) {
      const originalRawActValue = cue.actId;
      matchedAct = matchActToProduction(cue.actId, production.acts || []);
      cue.actId = matchedAct ? matchedAct.name : null;
      if (!matchedAct) {
        cue.notes = [cue.notes, `Act not matched: "${originalRawActValue}"`].filter(Boolean).join(' | ');
      }
    }

    if (cue.sceneId) {
      const originalRawSceneValue = cue.sceneId;
      const matchedScene = matchSceneToAct(cue.sceneId, matchedAct);
      cue.sceneId = matchedScene || null;
      if (!matchedScene) {
        cue.notes = [cue.notes, `Scene not matched: "${originalRawSceneValue}"`].filter(Boolean).join(' | ');
      }
    }

    if ('page' in cue) {
      if (cue.page) {
        cue.notes = [cue.notes, `Page: ${cue.page}`].filter(Boolean).join(' | ');
      }
      delete cue.page;
    }

    return cue;
  };

  const getColumnPreview = (header) => {
    for (const row of rows) {
      const v = row[header];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };

  const previewRows = rows.slice(0, 5).map(row => {
    const cue = buildCueFromRow(row);
    const willSkip = !cue.description && !cue.number;
    return { cue, willSkip };
  });

  const handleConfirmImport = () => {
    const cuesToImport = [];
    let skippedCount = 0;

    rows.forEach(row => {
      const cue = buildCueFromRow(row);
      if (!cue.description && !cue.number) {
        skippedCount++;
        return;
      }
      cuesToImport.push(cue);
    });

    const outcome = window.cueSheetService.addCuesBulk(production.id, cuesToImport);
    setResult({ imported: outcome.imported, skipped: skippedCount });
    setStep('done');

    if (onImportComplete) onImportComplete();
  };

  const getCueTypeLabel = (typeId) => {
    const match = (window.cueSheetService?.CUE_TYPES || []).find(t => t.id === typeId);
    return match ? match.label : typeId;
  };

  if (!isOpen) return null;

  // ── Step: upload ────────────────────────────────────────────────────────
  const renderUploadStep = () => React.createElement(
    'div',
    null,
    React.createElement('h3', { className: 'reset-dialog-title' }, 'Import Cues from File'),
    React.createElement(
      'p',
      { className: 'reset-dialog-body' },
      'Upload a CSV or Excel file. You’ll be able to map columns to cue fields and preview the results before anything is added to the cue sheet.'
    ),
    error && React.createElement(
      'div',
      { style: { color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' } },
      error
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: handleDownloadTemplate,
        style: {
          color: 'var(--color-text-muted)',
          textDecoration: 'underline',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          padding: 0,
          marginBottom: '0.75rem',
          display: 'block'
        }
      },
      'Download Template'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '1rem' } },
      React.createElement(
        'p',
        { className: 'reset-dialog-body', style: { marginBottom: '0.375rem' } },
        'Act accepts Pre-Show, Prologue, Act One–Five (or Act I–V), Intermission, Entr’acte, Epilogue, or Post-Show — matched automatically to however this production’s acts are actually named, in any of these formats (numbers, roman numerals, or spelled out).'
      ),
      React.createElement(
        'p',
        { className: 'reset-dialog-body', style: { marginBottom: '0.375rem' } },
        'Scene should reference the scene number or name as it appears in Scene Builder for that act.'
      ),
      React.createElement(
        'p',
        { className: 'reset-dialog-body', style: { marginBottom: '0.375rem' } },
        'Page is optional and stored as a note for reference — it does not affect scene matching.'
      ),
      React.createElement(
        'p',
        { className: 'reset-dialog-body', style: { marginBottom: 0 } },
        'A Scene cell containing a range like "1-3" will prompt you to choose whether to split it into multiple cues during import.'
      )
    ),
    React.createElement('input', {
      ref: fileInputRef,
      type: 'file',
      accept: '.csv,.xlsx,.xls',
      style: { display: 'none' },
      onChange: handleFileSelect
    }),
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
      React.createElement(
        'button',
        { type: 'button', className: 'btn-secondary', style: { padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }, onClick: handleCancel },
        'Cancel'
      ),
      React.createElement(
        'button',
        { type: 'button', className: 'btn-primary', style: { padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }, onClick: handleImportClick },
        'Choose File…'
      )
    )
  );

  // ── Step: mapping ───────────────────────────────────────────────────────
  const renderMappingStep = () => React.createElement(
    'div',
    null,
    React.createElement('h3', { className: 'reset-dialog-title' }, 'Map Columns'),
    React.createElement(
      'p',
      { className: 'reset-dialog-body' },
      `${rows.length} row${rows.length !== 1 ? 's' : ''} found. Choose which cue field each column maps to.`
    ),
    React.createElement(
      'div',
      { style: { overflowX: 'auto', marginBottom: '1.25rem' } },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', { style: thStyle }, 'Source Column'),
            React.createElement('th', { style: thStyle }, 'Maps To'),
            React.createElement('th', { style: thStyle }, 'Preview')
          )
        ),
        React.createElement(
          'tbody',
          null,
          headers.map(header => React.createElement(
            'tr',
            { key: header },
            React.createElement('td', { style: tdStyle }, header),
            React.createElement(
              'td',
              { style: tdStyle },
              React.createElement(
                'select',
                {
                  value: mapping[header] || 'skip',
                  onChange: (e) => handleMappingChange(header, e.target.value),
                  style: { padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.8125rem' }
                },
                CUE_IMPORT_MAPPING_OPTIONS.map(f => React.createElement('option', { key: f.key, value: f.key }, f.label))
              )
            ),
            React.createElement(
              'td',
              { style: { ...tdStyle, color: 'var(--color-text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
              getColumnPreview(header)
            )
          ))
        )
      )
    ),
    React.createElement('h3', { className: 'reset-dialog-title', style: { fontSize: '0.9375rem' } }, 'Preview'),
    React.createElement(
      'div',
      { style: { overflowX: 'auto', marginBottom: '1.25rem' } },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', { style: thStyle }, 'Type'),
            React.createElement('th', { style: thStyle }, 'Number'),
            React.createElement('th', { style: thStyle }, 'Description'),
            React.createElement('th', { style: thStyle }, 'Act / Scene')
          )
        ),
        React.createElement(
          'tbody',
          null,
          previewRows.map((r, idx) => React.createElement(
            'tr',
            { key: idx, style: r.willSkip ? { opacity: 0.5 } : undefined },
            React.createElement(
              'td',
              { style: tdStyle },
              React.createElement('span', { className: 'cue-type-badge', 'data-cue-type': r.cue.type }, getCueTypeLabel(r.cue.type))
            ),
            React.createElement('td', { style: tdStyle }, r.cue.number || '—'),
            React.createElement('td', { style: tdStyle }, r.willSkip ? 'Skipped — no description or number' : (r.cue.description || '—')),
            React.createElement(
              'td',
              { style: tdStyle },
              [r.cue.actId, r.cue.sceneId].filter(Boolean).join(' / ') ||
                (/(?:Act|Scene) not matched:/.test(r.cue.notes || '') ? '⚠ Not matched — see notes' : '—')
            )
          ))
        )
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
      React.createElement(
        'button',
        { type: 'button', className: 'btn-secondary', style: { padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }, onClick: handleCancel },
        'Cancel'
      ),
      React.createElement(
        'button',
        { type: 'button', className: 'btn-primary', style: { padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }, onClick: handleConfirmImport },
        'Confirm Import'
      )
    )
  );

  // ── Step: done ──────────────────────────────────────────────────────────
  const renderDoneStep = () => React.createElement(
    'div',
    null,
    React.createElement('h3', { className: 'reset-dialog-title' }, 'Import Complete'),
    React.createElement(
      'p',
      { className: 'reset-dialog-body' },
      `Imported ${result.imported} cue${result.imported !== 1 ? 's' : ''}.` +
        (result.skipped > 0 ? ` Skipped ${result.skipped} row${result.skipped !== 1 ? 's' : ''}.` : '')
    ),
    React.createElement(
      'button',
      { type: 'button', className: 'btn-primary', style: { width: '100%', padding: '0.5rem 0', borderRadius: '0.5rem', fontSize: '0.875rem' }, onClick: handleClose },
      'Close'
    )
  );

  const panelWidth = step === 'mapping' ? '840px' : '24rem';

  return React.createElement(
    'div',
    { className: 'reset-dialog-overlay', onClick: handleCancel },
    React.createElement(
      'div',
      {
        className: 'reset-dialog-panel',
        onClick: (e) => e.stopPropagation(),
        style: { maxWidth: panelWidth, maxHeight: '85vh', overflowY: 'auto' }
      },
      step === 'upload' && renderUploadStep(),
      step === 'mapping' && renderMappingStep(),
      step === 'done' && renderDoneStep()
    )
  );
}

const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)' };

window.CueSheetImportModal = CueSheetImportModal;

console.log('✅ CueSheetImportModal loaded');
