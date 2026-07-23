(function(global) {
  'use strict';

  const CUE_SHEET_KEY = 'scenestave_cue_sheets'; // { [productionId]: CueSheet }

  const CUE_TYPES = [
    { id: 'lighting',     label: 'LQ',   color: '#F59E0B', icon: '💡', description: 'Lighting cue — a change on the light board, like a fade, blackout, or color/intensity shift.' },
    { id: 'sound',        label: 'SQ',   color: '#3B82F6', icon: '🎵', description: 'Sound cue — playback of music, a sound effect, or other audio.' },
    { id: 'fly',          label: 'FLY',  color: '#8B5CF6', icon: '🪁', description: 'Fly cue — scenery, a drop, or a batten flown in or out via the fly system above the stage.' },
    { id: 'spot',         label: 'SP',   color: '#EC4899', icon: '🔦', description: 'Spotlight cue — a manually operated spotlight moving, focusing, or changing.' },
    { id: 'follow_spot',  label: 'FS',   color: '#F97316', icon: '🎯', description: 'Follow spot cue — an operator tracking a performer with a spotlight as they move.' },
    { id: 'deck',         label: 'DECK', color: '#10B981', icon: '🎭', description: 'Deck cue — a stage crew move, like shifting set pieces or furniture on the stage floor.' },
    { id: 'props',        label: 'PROP', color: '#CA8A04', icon: '🧰', description: 'Props cue — a hand prop needs to be set, struck, moved, or handed off.' },
    { id: 'wardrobe',     label: 'WARD', color: '#DB2777', icon: '👗', description: 'Wardrobe cue — a costume change, quick change, or wardrobe adjustment.' },
    { id: 'entrance',     label: 'ENT',  color: '#6366F1', icon: '🚶', description: 'Entrance cue — a performer entering or exiting.' },
    { id: 'intermission', label: 'INT',  color: '#64748B', icon: '⏸', description: 'Intermission — the scheduled break between acts.' },
    { id: 'other',        label: 'CUE',  color: '#94A3B8', icon: '📌', description: 'General cue — anything that doesn\'t fit the categories above.' },
  ];

  const defaultCueSheet = (productionId) => ({
    productionId,
    cues: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  });

  const newCue = (overrides = {}) => ({
    id: 'cue_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    number: '',           // e.g. "LQ 45" or "SQ 12"
    type: 'lighting',     // from CUE_TYPES ids
    sceneId: null,        // which scene this belongs to
    importFlags: [],      // import-time diagnostics, never shown as SM notes
    actId: null,
    assignedTo: '',       // display name of the person responsible (staff, crew, or cast member) — plain string, not an ID
    standbyWith: [],      // array of cue ids called on standby together
    goWith: [],           // array of cue ids fired on GO together
    triggerLine: '',      // what SM listens for to call GO
    description: '',      // what happens
    notes: '',            // SM private notes
    duration: null,       // seconds (optional)
    order: 0,             // absolute show order
    status: 'pending',    // pending | standby | go | running | completed
    autoFromScene: false, // true if auto-generated from scene data
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const loadCueSheet = (productionId) => {
    try {
      const all = JSON.parse(localStorage.getItem(CUE_SHEET_KEY) || '{}');
      return all[productionId] || defaultCueSheet(productionId);
    } catch { return defaultCueSheet(productionId); }
  };

  const saveCueSheet = (productionId, cueSheet) => {
    try {
      const all = JSON.parse(localStorage.getItem(CUE_SHEET_KEY) || '{}');
      all[productionId] = { ...cueSheet, updatedAt: new Date().toISOString() };
      localStorage.setItem(CUE_SHEET_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('cueSheetUpdated', { detail: { productionId } }));
      return true;
    } catch { return false; }
  };

  // Auto-generate cues from scene data (lighting + sound from Scene Builder)
  // Production structure: production.acts[].scenes[]
  const generateCuesFromScenes = (production) => {
    const cues = [];
    let order = 0;
    (production.acts || []).forEach(act => {
      (act.scenes || []).forEach(scene => {
        // Lighting cues
        if (scene.lighting?.mood || scene.lighting?.cues) {
          cues.push(newCue({
            type: 'lighting',
            number: scene.lighting?.cues || '',
            sceneId: scene.name,
            actId: act.name,
            description: [scene.lighting?.mood, scene.lighting?.intent].filter(Boolean).join(' — '),
            triggerLine: scene.name || 'Scene start',
            order: order++,
            autoFromScene: true,
          }));
        }
        // Sound cues
        if (scene.sound?.title || scene.sound?.type) {
          const isMusical = (scene.sound?.type || '').toLowerCase() === 'musical number';
          cues.push(newCue({
            type: 'sound',
            number: '',
            sceneId: scene.name,
            actId: act.name,
            description: isMusical
              ? `${scene.sound.title || 'Musical Number'} — ${scene.sound.fullCompany ? 'Full Company' : (scene.sound.performers || []).join(', ')}`
              : scene.sound.title || '',
            triggerLine: scene.name || 'Scene start',
            order: order++,
            autoFromScene: true,
          }));
        }
        // Actor entrances from characters
        if ((scene.characters || []).length > 0 && !scene.characters.includes('Full Company')) {
          cues.push(newCue({
            type: 'entrance',
            number: '',
            sceneId: scene.name,
            actId: act.name,
            description: `Standby: ${scene.characters.slice(0, 3).join(', ')}${scene.characters.length > 3 ? ` +${scene.characters.length - 3} more` : ''}`,
            triggerLine: scene.smNotes || '',
            order: order++,
            autoFromScene: true,
          }));
        }
        // Hazard warning cue
        if (scene.hazards) {
          cues.push(newCue({
            type: 'other',
            number: 'HAZARD',
            sceneId: scene.name,
            actId: act.name,
            description: `⚠️ ${scene.hazards}`,
            triggerLine: '',
            order: order++,
            autoFromScene: true,
          }));
        }
      });
    });
    return cues;
  };

  const addCue = (productionId, cueData) => {
    const sheet = loadCueSheet(productionId);
    const cue = newCue({ ...cueData, order: sheet.cues.length });
    sheet.cues = [...sheet.cues, cue];
    saveCueSheet(productionId, sheet);
    return cue;
  };

  const addCuesBulk = (productionId, cuesData) => {
    const sheet = loadCueSheet(productionId);
    const maxOrder = sheet.cues.reduce((max, c) => Math.max(max, c.order ?? -1), -1);
    const newCues = (cuesData || []).map((cueData, idx) =>
      newCue({ ...cueData, order: maxOrder + 1 + idx, importedFromFile: true })
    );
    sheet.cues = [...sheet.cues, ...newCues];
    saveCueSheet(productionId, sheet);
    return { imported: newCues.length };
  };

  const updateCue = (productionId, cueId, updates) => {
    const sheet = loadCueSheet(productionId);
    sheet.cues = sheet.cues.map(c => c.id === cueId ? { ...c, ...updates } : c);
    saveCueSheet(productionId, sheet);
  };

  const deleteCue = (productionId, cueId) => {
    const sheet = loadCueSheet(productionId);
    sheet.cues = sheet.cues.filter(c => c.id !== cueId);
    saveCueSheet(productionId, sheet);
  };

  const deleteCuesBulk = (productionId, cueIds) => {
    const sheet = loadCueSheet(productionId);
    const idSet = new Set(cueIds || []);
    const before = sheet.cues.length;
    sheet.cues = sheet.cues.filter(c => !idSet.has(c.id));
    saveCueSheet(productionId, sheet);
    return { deleted: before - sheet.cues.length };
  };

  const reorderCues = (productionId, cues) => {
    const sheet = loadCueSheet(productionId);
    sheet.cues = cues.map((c, idx) => ({ ...c, order: idx }));
    saveCueSheet(productionId, sheet);
  };

  global.cueSheetService = {
    CUE_TYPES,
    loadCueSheet,
    saveCueSheet,
    generateCuesFromScenes,
    addCue,
    addCuesBulk,
    updateCue,
    deleteCue,
    deleteCuesBulk,
    reorderCues,
    newCue,
  };
})(window);

console.log('✅ cueSheetService loaded');
