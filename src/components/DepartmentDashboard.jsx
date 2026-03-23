const { useState, useEffect } = React;

const DEPT_CONFIG = {
  wardrobe: {
    label: 'Wardrobe Department',
    icon: '👗',
    color: 'pink',
    budgetField: 'wardrobeBudget',
    getItems: (scene) => scene.wardrobe?.items || [],
    statusColors: {
      'Ready': 'green', 'Acquired': 'blue', 'In Progress': 'yellow',
      'Fitting Required': 'amber', 'Alterations': 'orange', 'To Source': 'red',
    },
    overdueStatuses: ['To Source', 'In Progress', 'Fitting Required'],
    readyStatus: 'Ready',
    stats: (items) => ({
      total: items.length,
      ready: items.filter(i => i.status === 'Ready').length,
      toSource: items.filter(i => i.status === 'To Source').length,
      inProgress: items.filter(i => ['In Progress','Fitting Required','Alterations'].includes(i.status)).length,
    }),
    statLabels: { total: 'Total Costumes', ready: 'Ready', toSource: 'To Source', inProgress: 'In Progress' },
  },
  props: {
    label: 'Props Department',
    icon: '📦',
    color: 'orange',
    budgetField: 'propsBudget',
    getItems: (scene) => scene.props?.items || [],
    statusColors: {
      'Ready': 'green', 'Acquired': 'blue', 'In Progress': 'yellow',
      'To Source': 'red', 'Needs Repair': 'orange', 'On Stage': 'purple',
    },
    overdueStatuses: ['To Source', 'In Progress'],
    readyStatus: 'Ready',
    stats: (items) => ({
      total: items.length,
      ready: items.filter(i => i.status === 'Ready').length,
      toSource: items.filter(i => i.status === 'To Source').length,
      acquired: items.filter(i => i.status === 'Acquired').length,
    }),
    statLabels: { total: 'Total Props', ready: 'Ready', toSource: 'To Source', acquired: 'Acquired' },
  },
  lighting: {
    label: 'Lighting Department',
    icon: '💡',
    color: 'yellow',
    budgetField: 'lightingBudget',
    getItems: (scene) => scene.lighting?.fixtures || [],
    statusColors: { 'Set': 'green', 'Pending': 'yellow', 'TBD': 'gray' },
    overdueStatuses: ['TBD', 'Pending'],
    readyStatus: 'Set',
    stats: (items, scenes) => ({
      total: scenes.length,
      withMood: scenes.filter(s => s.lighting?.mood).length,
      withCues: scenes.filter(s => s.lighting?.cues).length,
      fixtures: items.length,
    }),
    statLabels: { total: 'Total Scenes', withMood: 'Mood Set', withCues: 'Cues Written', fixtures: 'Fixtures' },
  },
  sound: {
    label: 'Sound Department',
    icon: '🎵',
    color: 'blue',
    budgetField: 'soundBudget',
    getItems: (scene) => scene.sound?.cues || [],
    statusColors: { 'Set': 'green', 'Pending': 'yellow', 'TBD': 'gray' },
    overdueStatuses: ['TBD'],
    readyStatus: 'Set',
    stats: (items, scenes) => ({
      total: scenes.length,
      withMusic: scenes.filter(s => s.sound?.title || s.sound?.musicTitle).length,
      cues: items.length,
      withType: scenes.filter(s => s.sound?.type || s.sound?.soundType).length,
    }),
    statLabels: { total: 'Total Scenes', withMusic: 'Music Assigned', cues: 'Sound Cues', withType: 'Type Set' },
  },
  set: {
    label: 'Set & Scenic Department',
    icon: '🏗️',
    color: 'teal',
    budgetField: 'setBudget',
    getItems: (scene) => scene.set?.pieces || [],
    statusColors: {
      'Ready': 'green', 'In Progress': 'yellow', 'Acquired': 'blue',
      'To Build': 'red', 'Needs Repair': 'orange',
    },
    overdueStatuses: ['To Build', 'In Progress'],
    readyStatus: 'Ready',
    stats: (items) => ({
      total: items.length,
      ready: items.filter(i => i.status === 'Ready').length,
      inProgress: items.filter(i => i.status === 'In Progress').length,
      toBuild: items.filter(i => i.status === 'To Build').length,
    }),
    statLabels: { total: 'Total Pieces', ready: 'Ready', inProgress: 'In Progress', toBuild: 'To Build' },
  },
  stage_manager: {
    label: 'Stage Management',
    icon: '📋',
    color: 'violet',
    budgetField: null,
    getItems: () => [],
    statusColors: {},
    overdueStatuses: [],
    readyStatus: null,
    stats: (items, scenes) => ({
      total: scenes.length,
      withNotes: scenes.filter(s => s.notes || s.stageNotes).length,
      withBlocking: scenes.filter(s => s.blocking).length,
      withCast: scenes.filter(s => (s.characters || []).length > 0).length,
    }),
    statLabels: { total: 'Total Scenes', withNotes: 'With Notes', withBlocking: 'Blocking Set', withCast: 'Cast Assigned' },
  },
  director: {
    label: 'Director',
    icon: '🎬',
    color: 'violet',
    budgetField: 'overallBudget',
    getItems: () => [],
    statusColors: {},
    overdueStatuses: [],
    readyStatus: null,
    stats: (items, scenes, production) => ({
      total: scenes.length,
      acts: (production?.acts || []).length,
      cast: scenes.reduce((acc, s) => acc + (s.characters || []).length, 0),
      withLighting: scenes.filter(s => s.lighting?.mood).length,
    }),
    statLabels: { total: 'Scenes', acts: 'Acts', cast: 'Cast Roles', withLighting: 'Lit Scenes' },
  },
};

const DEPT_EVENT_TYPES = {
  wardrobe:      ['costume-fitting','wardrobe-call','deadline','rehearsal','show'],
  props:         ['props-pull','props-return','deadline','rehearsal','show'],
  lighting:      ['focus-call','hang-focus','deadline','rehearsal','show'],
  sound:         ['sound-check','load-in','deadline','rehearsal','show'],
  set:           ['load-in','deadline','rehearsal','show'],
  stage_manager: ['rehearsal','show','technical','meeting','deadline'],
  director:      ['rehearsal','show','technical','audition','meeting'],
};

const SUPER_ROLES = ['super_admin', 'venue_manager', 'admin', 'client_admin'];

const DepartmentDashboard = () => {
  const userRole = localStorage.getItem('showsuite_user_role') || 'admin';
  const staffContactId = localStorage.getItem('showsuite_staff_contact_id') || '';

  const [allProductions, setAllProductions] = useState(() =>
    JSON.parse(localStorage.getItem('showsuite_productions') || '[]')
  );

  useEffect(() => {
    const onFocus = () => {
      setAllProductions(JSON.parse(localStorage.getItem('showsuite_productions') || '[]'));
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const contacts = window.contactsService?.loadContacts?.() || [];

  // Resolve assigned productions
  const assignedProductions = (() => {
    if (SUPER_ROLES.includes(userRole)) return allProductions;
    if (!staffContactId) return allProductions;
    const contact = contacts.find(c => c.id === staffContactId);
    const assignedIds = new Set(
      (contact?.staffProfile?.productions || [])
        .filter(p => ['active','invited'].includes(p.status))
        .map(p => p.productionId)
    );
    return allProductions.filter(p => assignedIds.has(p.id));
  })();

  const deptKey = DEPT_CONFIG[userRole] ? userRole : 'director';
  const config = DEPT_CONFIG[deptKey];

  // Aggregate dept items across all assigned productions
  const allItems = assignedProductions.flatMap(prod =>
    (prod.scenes || []).flatMap(scene =>
      config.getItems(scene).map(item => ({
        ...item,
        productionTitle: prod.title,
        productionId: prod.id,
        sceneName: scene.name || scene.sceneLabel || '',
      }))
    )
  );

  const allScenes = assignedProductions.flatMap(prod =>
    (prod.scenes || []).map(scene => ({ ...scene, productionTitle: prod.title, productionId: prod.id }))
  );

  // Budget aggregation
  const budgetData = config.budgetField ? assignedProductions.map(prod => {
    const allocated = parseFloat(prod[config.budgetField]) || 0;
    const items = (prod.scenes || []).flatMap(scene => config.getItems(scene));
    const spent = items.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    return { production: prod, allocated, spent, variance: allocated - spent };
  }) : [];

  const totalAllocated = budgetData.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const budgetAlerts = budgetData.filter(b => b.allocated > 0 && b.spent > b.allocated * 0.9);

  // Overdue / needs attention items
  const overdueItems = allItems.filter(item =>
    config.overdueStatuses.includes(item.status) ||
    (item.returnDate && new Date(item.returnDate) < new Date())
  );

  // Upcoming events
  const today = new Date();
  const allowedTypes = DEPT_EVENT_TYPES[deptKey] || [];
  const upcomingEvents = assignedProductions
    .flatMap(prod =>
      (prod.calendar || []).map(ev => ({
        ...ev,
        productionTitle: prod.title,
        productionId: prod.id,
        _date: new Date(ev.start || ev.date || ev.datetime),
      }))
    )
    .filter(ev =>
      !isNaN(ev._date) &&
      ev._date >= today &&
      allowedTypes.some(t => (ev.type || '').toLowerCase().includes(t))
    )
    .sort((a, b) => a._date - b._date)
    .slice(0, 8);

  const stats = config.stats(allItems, allScenes, assignedProductions[0]);

  const staffContact = staffContactId ? contacts.find(c => c.id === staffContactId) : null;
  const staffName = staffContact
    ? (`${staffContact.firstName || ''} ${staffContact.lastName || ''}`).trim() || staffContact.email
    : null;

  const itemWord = ['lighting', 'sound', 'stage_manager', 'director'].includes(deptKey) ? 'scenes' : 'items';

  // ── helpers ────────────────────────────────────────────────────────────────

  const fmt = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const StatCard = ({ value, label }) =>
    React.createElement('div', {
      className: 'bg-gray-800 rounded-lg p-4 border border-gray-700'
    },
      React.createElement('div', { className: 'text-3xl font-bold text-white mb-1' }, value),
      React.createElement('div', { className: 'text-sm text-gray-400' }, label)
    );

  // ── render ─────────────────────────────────────────────────────────────────

  return React.createElement('div', { className: 'max-w-[1400px] mx-auto p-6 space-y-6' },

    // Header
    React.createElement('div', { className: 'flex items-center justify-between flex-wrap gap-3' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-3xl font-bold text-white mb-1' },
          `${config.icon} ${config.label} Dashboard`
        ),
        React.createElement('p', { className: 'text-gray-400' },
          `${assignedProductions.length} production${assignedProductions.length !== 1 ? 's' : ''} · ${allItems.length} ${itemWord} total`
        )
      ),
      staffName && React.createElement('div', {
        className: 'text-sm text-violet-300 bg-violet-900/60 border border-violet-700 px-3 py-1.5 rounded-full'
      }, `👤 ${staffName}`)
    ),

    // Quick stats
    React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4' },
      ...Object.entries(stats).map(([key, value]) =>
        React.createElement(StatCard, { key, value, label: config.statLabels[key] || key })
      )
    ),

    // Main grid
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },

      // ── Budget panel (only when budgetField is configured) ──
      config.budgetField
        ? React.createElement('div', { className: 'bg-gray-800 rounded-lg p-5 border border-gray-700' },
            React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4' }, '💰 Budget'),
            totalAllocated === 0
              ? React.createElement('p', { className: 'text-gray-500 text-sm italic' }, 'No budget allocated yet')
              : React.createElement('div', { className: 'space-y-3' },
                  // Overall bar
                  React.createElement('div', null,
                    React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
                      React.createElement('span', { className: 'text-gray-400' }, 'Total Allocated'),
                      React.createElement('span', { className: 'text-white font-medium' }, fmt(totalAllocated))
                    ),
                    React.createElement('div', { className: 'w-full bg-gray-700 rounded-full h-2' },
                      React.createElement('div', {
                        className: `h-2 rounded-full ${
                          totalSpent > totalAllocated ? 'bg-red-500'
                          : totalSpent > totalAllocated * 0.8 ? 'bg-amber-500'
                          : 'bg-green-500'
                        }`,
                        style: { width: `${Math.min(100, totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0)}%` }
                      })
                    ),
                    React.createElement('div', { className: 'flex justify-between text-xs mt-1 text-gray-500' },
                      React.createElement('span', null, `Spent: ${fmt(totalSpent)}`),
                      React.createElement('span', null, `Remaining: ${fmt(totalAllocated - totalSpent)}`)
                    )
                  ),
                  // Per-production breakdown
                  ...budgetData.map(b =>
                    React.createElement('div', { key: b.production.id, className: 'text-sm flex justify-between items-center' },
                      React.createElement('span', { className: 'text-gray-400 truncate mr-2' }, b.production.title),
                      React.createElement('span', {
                        className: b.variance < 0 ? 'text-red-400 whitespace-nowrap'
                          : b.allocated > 0 && b.variance < b.allocated * 0.2 ? 'text-amber-400 whitespace-nowrap'
                          : 'text-green-400 whitespace-nowrap'
                      },
                        b.variance < 0
                          ? `⚠ ${fmt(Math.abs(b.variance))} over`
                          : `${fmt(b.variance)} left`
                      )
                    )
                  )
                )
          )
        : null,

      // ── Alerts ──
      React.createElement('div', { className: 'bg-gray-800 rounded-lg p-5 border border-gray-700' },
        React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4' },
          `🔔 Alerts${budgetAlerts.length + overdueItems.length > 0 ? ` (${budgetAlerts.length + overdueItems.length})` : ''}`
        ),
        budgetAlerts.length === 0 && overdueItems.length === 0
          ? React.createElement('p', { className: 'text-gray-500 text-sm italic' }, '✓ No alerts — everything looks good')
          : React.createElement('div', { className: 'space-y-2' },
              ...budgetAlerts.map(b =>
                React.createElement('div', {
                  key: b.production.id,
                  className: 'flex items-start gap-2 p-2 bg-red-900/30 border border-red-800 rounded text-sm'
                },
                  React.createElement('span', null, '💸'),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-red-300 font-medium' },
                      `${b.production.title} — Budget ${b.spent > b.allocated ? 'exceeded' : 'near limit'}`
                    ),
                    React.createElement('div', { className: 'text-red-400 text-xs' },
                      `${fmt(b.spent)} of ${fmt(b.allocated)} used (${Math.round((b.spent / b.allocated) * 100)}%)`
                    )
                  )
                )
              ),
              ...overdueItems.slice(0, 5).map((item, idx) =>
                React.createElement('div', {
                  key: item.id || idx,
                  className: 'flex items-start gap-2 p-2 bg-amber-900/30 border border-amber-800 rounded text-sm'
                },
                  React.createElement('span', null, '⚠️'),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-amber-300 font-medium truncate' },
                      item.name || item.description || 'Unnamed item'
                    ),
                    React.createElement('div', { className: 'text-amber-400 text-xs' },
                      `${item.status || 'Needs attention'} · ${item.productionTitle}${item.sceneName ? ' · ' + item.sceneName : ''}`
                    )
                  )
                )
              ),
              overdueItems.length > 5 && React.createElement('p', {
                className: 'text-xs text-gray-500 text-center pt-1'
              }, `+${overdueItems.length - 5} more items need attention`)
            )
      ),

      // ── Upcoming Events ──
      React.createElement('div', { className: 'bg-gray-800 rounded-lg p-5 border border-gray-700' },
        React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4' }, '📅 Upcoming Events'),
        upcomingEvents.length === 0
          ? React.createElement('p', { className: 'text-gray-500 text-sm italic' }, 'No upcoming events')
          : React.createElement('div', { className: 'space-y-1' },
              ...upcomingEvents.map((ev, idx) =>
                React.createElement('div', {
                  key: ev.id || idx,
                  className: 'flex items-start gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors',
                  onClick: () => { window.location.hash = `#/productions/${ev.productionId}?tab=calendar`; }
                },
                  React.createElement('div', {
                    className: 'text-xs text-center bg-gray-700 rounded px-2 py-1 min-w-[44px] shrink-0'
                  },
                    React.createElement('div', { className: 'text-gray-400 uppercase' },
                      ev._date.toLocaleString('default', { month: 'short' })
                    ),
                    React.createElement('div', { className: 'text-white font-bold text-base' },
                      ev._date.getDate()
                    )
                  ),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'text-white text-sm font-medium truncate' },
                      ev.title || ev.type
                    ),
                    React.createElement('div', { className: 'text-gray-400 text-xs' },
                      `${ev.productionTitle} · ${ev._date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    )
                  )
                )
              )
            )
      ),

      // ── My Productions ──
      React.createElement('div', { className: 'bg-gray-800 rounded-lg p-5 border border-gray-700' },
        React.createElement('h3', { className: 'text-lg font-semibold text-white mb-4' }, '🎭 My Productions'),
        assignedProductions.length === 0
          ? React.createElement('div', { className: 'text-center py-6' },
              React.createElement('p', { className: 'text-gray-500 text-sm' }, 'No productions assigned yet'),
              React.createElement('p', { className: 'text-gray-600 text-xs mt-1' }, 'Ask your admin to assign you to a production')
            )
          : React.createElement('div', { className: 'space-y-2' },
              ...assignedProductions.map(prod => {
                const prodItems = (prod.scenes || []).flatMap(s => config.getItems(s));
                const readyCount = config.readyStatus
                  ? prodItems.filter(i => i.status === config.readyStatus).length
                  : 0;
                const pct = prodItems.length > 0
                  ? Math.round((readyCount / prodItems.length) * 100)
                  : null;
                return React.createElement('div', {
                  key: prod.id,
                  className: 'flex items-center gap-3 p-3 rounded-lg bg-gray-750 border border-gray-600 cursor-pointer hover:border-violet-500 transition-colors',
                  onClick: () => { window.location.hash = `#/productions/${prod.id}`; }
                },
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'text-white font-medium truncate' }, prod.title),
                    React.createElement('div', { className: 'text-gray-400 text-xs' }, prod.status || 'Active')
                  ),
                  pct !== null && React.createElement('div', { className: 'text-right shrink-0' },
                    React.createElement('div', { className: 'text-xs text-gray-400' },
                      `${readyCount}/${prodItems.length} ready`
                    ),
                    React.createElement('div', {
                      className: `text-xs font-medium ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`
                    }, `${pct}%`)
                  )
                );
              })
            )
      )
    )
  );
};

window.DepartmentDashboard = DepartmentDashboard;
