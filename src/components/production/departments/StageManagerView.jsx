const { useState, useEffect } = React;

// Stage Manager Department View - collaboration hub and show bible
function StageManagerView({ production, onUpdateScene, onUpdateProduction }) {
  const [expandedActs, setExpandedActs] = useState({});
  const [activeSection, setActiveSection] = useState('cuesheet');
  const [preShowChecklist, setPreShowChecklist] = useState(production?.smPreShowChecklist || []);
  const [intermissionChecklist, setIntermissionChecklist] = useState(production?.smIntermissionChecklist || []);
  const [newPreShowItem, setNewPreShowItem] = useState('');
  const [newIntermissionItem, setNewIntermissionItem] = useState('');

  // Toggle act expansion
  const toggleAct = (actIndex) => {
    setExpandedActs(prev => ({
      ...prev,
      [actIndex]: !prev[actIndex]
    }));
  };

  // Initialize all acts as expanded
  useEffect(() => {
    if (production?.acts) {
      const expanded = {};
      production.acts.forEach((_, idx) => expanded[idx] = true);
      setExpandedActs(expanded);
    }
    setPreShowChecklist(production?.smPreShowChecklist || []);
    setIntermissionChecklist(production?.smIntermissionChecklist || []);
  }, [production?.id]);

  // Handle SM-specific field updates
  const handleSMUpdate = (actIndex, sceneIndex, field, value) => {
    onUpdateScene?.(actIndex, sceneIndex, field, value);
  };

  // Checklist handlers
  const addChecklistItem = (type) => {
    const newItem = { id: 'chk_' + Date.now(), text: type === 'preshow' ? newPreShowItem : newIntermissionItem, completed: false };
    if (type === 'preshow') {
      const updated = [...preShowChecklist, newItem];
      setPreShowChecklist(updated);
      setNewPreShowItem('');
      onUpdateProduction?.({ smPreShowChecklist: updated });
    } else {
      const updated = [...intermissionChecklist, newItem];
      setIntermissionChecklist(updated);
      setNewIntermissionItem('');
      onUpdateProduction?.({ smIntermissionChecklist: updated });
    }
  };

  const toggleChecklistItem = (type, itemId) => {
    if (type === 'preshow') {
      const updated = preShowChecklist.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setPreShowChecklist(updated);
      onUpdateProduction?.({ smPreShowChecklist: updated });
    } else {
      const updated = intermissionChecklist.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setIntermissionChecklist(updated);
      onUpdateProduction?.({ smIntermissionChecklist: updated });
    }
  };

  const deleteChecklistItem = (type, itemId) => {
    if (type === 'preshow') {
      const updated = preShowChecklist.filter(item => item.id !== itemId);
      setPreShowChecklist(updated);
      onUpdateProduction?.({ smPreShowChecklist: updated });
    } else {
      const updated = intermissionChecklist.filter(item => item.id !== itemId);
      setIntermissionChecklist(updated);
      onUpdateProduction?.({ smIntermissionChecklist: updated });
    }
  };

  // Get character name by ID
  const getCharacterName = (charId) => {
    const char = (production?.characters || []).find(c => c.id === charId);
    return char?.name || 'Unknown';
  };

  // Calculate totals
  const totalScenes = production?.acts?.reduce((sum, act) => sum + (act.scenes?.length || 0), 0) || 0;
  const totalRunTime = production?.acts?.reduce((sum, act) => 
    sum + (act.scenes?.reduce((s, scene) => s + (parseInt(scene.smRunTime) || 0), 0) || 0), 0
  ) || 0;

  if (!production?.acts?.length) {
    return React.createElement(
      'div',
      { className: 'text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300' },
      React.createElement('p', { className: 'text-gray-500 text-lg mb-2' }, '📋 Stage Manager'),
      React.createElement('p', { className: 'text-gray-400 text-sm' }, 'No scenes have been created yet.'),
      React.createElement('p', { className: 'text-gray-400 text-sm' }, 'Add acts and scenes in the Scenes tab first.')
    );
  }

  // Section tabs
  const sectionTabs = React.createElement(
    'div',
    { className: 'flex gap-2 mb-6' },
    [
      { id: 'cuesheet', label: '📋 Cue Sheet', desc: 'Cue-to-cue builder' },
      { id: 'runsheet', label: '📄 Run Sheet', desc: 'Scene-by-scene overview' },
      { id: 'checklists', label: '✅ Checklists', desc: 'Pre-show & intermission' }
    ].map(section =>
      React.createElement(
        'button',
        {
          key: section.id,
          onClick: () => setActiveSection(section.id),
          className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
            (activeSection === section.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
        },
        section.label
      )
    )
  );

  // Helper: detect empty/unset department values
  const isEmpty = (val) => !val || val === 'Not set' || val === 'None assigned' || (Array.isArray(val) && val.length === 0);

  // Run Sheet Section
  const runSheetContent = React.createElement(
    'div',
    null,
    // Header with stats
    React.createElement(
      'div',
      { className: 'flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg' },
      React.createElement(
        'div',
        null,
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, '📄 Run Sheet'),
        React.createElement('p', { className: 'text-sm text-gray-600' }, 'Complete scene breakdown with all department data')
      ),
      React.createElement(
        'div',
        { className: 'text-right' },
        React.createElement('p', { className: 'text-sm font-medium text-gray-700' }, totalScenes + ' scenes'),
        React.createElement('p', { className: 'text-xs text-gray-500' }, 
          'Est. run time: ' + Math.floor(totalRunTime / 60) + 'h ' + (totalRunTime % 60) + 'm'
        )
      )
    ),
    // Acts and scenes
    React.createElement(
      'div',
      { className: 'space-y-4' },
      production.acts.map((act, actIndex) =>
        React.createElement(
          'div',
          { key: actIndex, className: 'bg-white rounded-lg border border-gray-200 overflow-hidden' },
          // Act header
          React.createElement(
            'div',
            { 
              className: 'flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100',
              onClick: () => toggleAct(actIndex)
            },
            React.createElement(
              'div',
              { className: 'flex items-center gap-3' },
              React.createElement(
                'span',
                { className: 'text-gray-400 transition-transform ' + (expandedActs[actIndex] ? 'rotate-90' : '') },
                '▶'
              ),
              React.createElement('span', { className: 'font-semibold text-gray-800' }, act.name || 'Act ' + (actIndex + 1)),
              React.createElement(
                'span',
                { className: 'text-sm text-gray-500' },
                (act.scenes?.length || 0) + ' scene' + ((act.scenes?.length || 0) !== 1 ? 's' : '')
              )
            )
          ),
          // Scenes
          expandedActs[actIndex] && (act.scenes?.length > 0
            ? React.createElement(
                'div',
                { className: 'rs-scene-list' },
                act.scenes.map((scene, sceneIndex) =>
                  React.createElement(
                    'div',
                    { key: sceneIndex, className: 'p-4' },
                    // Scene header
                    React.createElement(
                      'div',
                      { className: 'flex items-center justify-between mb-3' },
                      React.createElement(
                        'div',
                        { className: 'flex items-center gap-2' },
                        (act.name) && React.createElement(
                          'span',
                          { className: 'text-gray-400 text-xs' },
                          act.name + ' —'
                        ),
                        React.createElement(
                          'span',
                          { className: 'rs-scene-badge px-2 py-1 text-xs font-medium rounded' },
                          'Scene ' + (scene.number || sceneIndex + 1)
                        ),
                        scene.label && scene.label !== 'Custom' && React.createElement(
                          'span',
                          { className: 'text-sm text-gray-600' },
                          scene.label
                        ),
                        scene.label === 'Custom' && scene.customLabel && React.createElement(
                          'span',
                          { className: 'text-sm text-gray-600' },
                          scene.customLabel
                        ),
                        scene.name && React.createElement(
                          'span',
                          { className: 'text-sm font-medium text-gray-800' },
                          '— ' + scene.name
                        )
                      ),
                      // Run time input
                      React.createElement(
                        'div',
                        { className: 'flex items-center gap-2' },
                        React.createElement('span', { className: 'text-xs text-gray-500' }, 'Run time:'),
                        React.createElement('input', {
                          type: 'number',
                          min: 0,
                          value: scene.smRunTime || '',
                          onChange: (e) => handleSMUpdate(actIndex, sceneIndex, 'smRunTime', e.target.value),
                          className: 'w-16 px-2 py-1 border-theme rounded text-sm text-center bg-surface text-primary-color',
                          placeholder: '0'
                        }),
                        React.createElement('span', { className: 'text-xs text-gray-500' }, 'min')
                      )
                    ),
                    // Hazard warning banner
                    scene.hazards && React.createElement(
                      'div',
                      { className: 'rs-hazard-banner' },
                      `⚠️ Hazard: ${scene.hazards}`
                    ),
                    // Department data summary (read-only)
                    React.createElement(
                      'div',
                      { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3' },
                      // Characters
                      (() => {
                        const charVal = scene.characterIds?.length > 0
                          ? scene.characterIds.map(id => getCharacterName(id)).join(', ')
                          : null;
                        const charEmpty = isEmpty(charVal);
                        return React.createElement(
                          'div',
                          { className: charEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'violet' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'violet' }, '🎭 Characters'),
                          charEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ None assigned')
                            : React.createElement('p', { className: 'rs-card-value' }, charVal)
                        );
                      })(),
                      // Lighting
                      (() => {
                        const lightVal = [scene.lightingCue, scene.lightingMood, scene.lightingColor].filter(Boolean).join(' • ') || null;
                        const lightEmpty = isEmpty(lightVal);
                        return React.createElement(
                          'div',
                          { className: lightEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'yellow' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'yellow' }, '💡 Lighting'),
                          lightEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ Not set')
                            : React.createElement('p', { className: 'rs-card-value' }, lightVal)
                        );
                      })(),
                      // Sound
                      (() => {
                        const soundVal = [scene.songTitle, scene.artist, scene.soundType].filter(Boolean).join(' • ') || null;
                        const soundEmpty = isEmpty(soundVal);
                        return React.createElement(
                          'div',
                          { className: soundEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'green' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'green' }, '🔊 Sound'),
                          soundEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ Not set')
                            : React.createElement('p', { className: 'rs-card-value' }, soundVal)
                        );
                      })(),
                      // Setting (location/time + set notes)
                      (() => {
                        const locationTime = [scene.location, scene.time].filter(Boolean).join(' — ');
                        const settingVal = [locationTime, scene.set?.notes].filter(Boolean).join(' • ') || null;
                        const settingEmpty = isEmpty(settingVal);
                        return React.createElement(
                          'div',
                          { className: settingEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'gray' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'gray' }, '📍 Setting'),
                          settingEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ Not set')
                            : React.createElement('p', { className: 'rs-card-value' }, settingVal)
                        );
                      })(),
                      // Props
                      (() => {
                        const propsArr = Array.isArray(scene.props) ? scene.props : [];
                        const propsVal = propsArr
                          .map(p => {
                            const name = (p.name || '').trim();
                            if (!name) return null;
                            return p.character ? `${name} (${p.character})` : name;
                          })
                          .filter(Boolean)
                          .join(', ') || null;
                        const propsEmpty = isEmpty(propsVal);
                        return React.createElement(
                          'div',
                          { className: propsEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'props' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'props' }, '🧰 Props'),
                          propsEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ None assigned')
                            : React.createElement('p', { className: 'rs-card-value' }, propsVal)
                        );
                      })(),
                      // Wardrobe
                      (() => {
                        const costumesObj = scene.wardrobe?.costumes || {};
                        const wardrobeVal = Object.keys(costumesObj)
                          .map(roleId => {
                            const data = costumesObj[roleId] || {};
                            if (!data.description) return null;
                            const char = (production.characters || []).find(c => (c.id || c.name) === roleId);
                            const charName = char?.name || roleId;
                            return `${charName}: ${data.description}`;
                          })
                          .filter(Boolean)
                          .join('; ') || null;
                        const wardrobeEmpty = isEmpty(wardrobeVal);
                        return React.createElement(
                          'div',
                          { className: wardrobeEmpty ? 'rs-card rs-card--empty' : 'rs-card', 'data-rs-color': 'wardrobe' },
                          React.createElement('p', { className: 'rs-card-label', 'data-rs-color': 'wardrobe' }, '👗 Wardrobe'),
                          wardrobeEmpty
                            ? React.createElement('span', { className: 'italic text-gray-400 text-xs' }, '⚠ None assigned')
                            : React.createElement('p', { className: 'rs-card-value' }, wardrobeVal)
                        );
                      })()
                    ),
                    // SM Calling Note (editable — same field as Scene Builder's SM Calling Note)
                    React.createElement(
                      'div',
                      { className: 'rs-notes-box' },
                      React.createElement('label', { className: 'block text-xs font-medium text-accent-gold mb-1' }, '📋 SM Calling Note'),
                      React.createElement('textarea', {
                        value: scene.smNotes || '',
                        onChange: (e) => handleSMUpdate(actIndex, sceneIndex, 'smNotes', e.target.value),
                        className: 'rs-notes-textarea w-full px-3 py-2 rounded text-sm resize-y',
                        rows: 2,
                        placeholder: 'SM notes for calling this scene — standby cues, special calls...'
                      })
                    ),
                    // Director's Notes to SM (read-only — edited in Scene Builder's Director view)
                    scene.smDirectorNotes && React.createElement(
                      'div',
                      { className: 'mt-2' },
                      React.createElement('p', { className: 'text-xs font-medium text-muted-color mb-1' }, "📋 Director's Notes to SM"),
                      React.createElement('p', { className: 'text-xs italic text-muted-color' }, scene.smDirectorNotes)
                    )
                  )
                )
              )
            : React.createElement(
                'div',
                { className: 'p-4 text-center text-gray-500 text-sm' },
                'No scenes in this act'
              )
          )
        )
      )
    )
  );

  // Checklists Section
  const renderChecklist = (type, items, newItem, setNewItem) => {
    const title = type === 'preshow' ? '🎬 Pre-Show Checklist' : '⏸️ Intermission Checklist';
    
    return React.createElement(
      'div',
      { className: 'bg-white rounded-lg border border-gray-200 p-4' },
      React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3' }, title),
      // Checklist items
      React.createElement(
        'div',
        { className: 'space-y-2 mb-3' },
        items.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 italic' }, 'No items yet')
          : items.map(item =>
              React.createElement(
                'div',
                { key: item.id, className: 'flex items-center gap-2 p-2 bg-gray-50 rounded' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: item.completed,
                  onChange: () => toggleChecklistItem(type, item.id),
                  className: 'w-4 h-4 text-blue-600 rounded'
                }),
                React.createElement(
                  'span',
                  { className: 'flex-1 text-sm ' + (item.completed ? 'line-through text-gray-400' : 'text-gray-700') },
                  item.text
                ),
                React.createElement(
                  'button',
                  {
                    onClick: () => deleteChecklistItem(type, item.id),
                    className: 'text-gray-400 hover:text-red-600 text-sm'
                  },
                  '🗑'
                )
              )
            )
      ),
      // Add new item
      React.createElement(
        'div',
        { className: 'flex gap-2' },
        React.createElement('input', {
          type: 'text',
          value: newItem,
          onChange: (e) => setNewItem(e.target.value),
          onKeyPress: (e) => e.key === 'Enter' && newItem.trim() && addChecklistItem(type),
          className: 'flex-1 px-3 py-2 border border-gray-300 rounded text-sm',
          placeholder: 'Add new item...'
        }),
        React.createElement(
          'button',
          {
            onClick: () => newItem.trim() && addChecklistItem(type),
            disabled: !newItem.trim(),
            className: 'px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50'
          },
          '+ Add'
        )
      )
    );
  };

  const checklistsContent = React.createElement(
    'div',
    { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
    renderChecklist('preshow', preShowChecklist, newPreShowItem, setNewPreShowItem),
    renderChecklist('intermission', intermissionChecklist, newIntermissionItem, setNewIntermissionItem)
  );

  return React.createElement(
    'div',
    { className: 'sm-view-root' },
    sectionTabs,
    React.createElement(
      'div',
      { className: 'sm-view-content' },
      activeSection === 'runsheet' ? runSheetContent :
      activeSection === 'checklists' ? checklistsContent :
      (window.CueSheetBuilder
        ? React.createElement(window.CueSheetBuilder, { production, userRole: 'stage_manager' })
        : React.createElement('div', { className: 'text-center py-12 text-gray-400' }, 'Loading cue sheet...')
      )
    )
  );
}

window.StageManagerView = StageManagerView;
