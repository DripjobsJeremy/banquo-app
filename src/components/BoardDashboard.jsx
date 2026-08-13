const BoardDashboard = () => {
  const [runwaySettings, setRunwaySettings] = React.useState(() => window.runwayService?.loadSettings?.() || { cashOnHand: 0, monthlyOperatingExpense: 0, monthlyContributedIncome: 0, lastUpdated: null });
  const [isEditingRunway, setIsEditingRunway] = React.useState(false);
  const [runwayForm, setRunwayForm] = React.useState(runwaySettings);

  const productions = JSON.parse(localStorage.getItem('showsuite_productions') || '[]');
  const donations   = window.donationsService?.loadDonations?.() || [];
  const contacts    = window.contactsService?.loadContacts?.()   || [];
  const atRiskProductions = window.breakEvenService?.getAllAtRisk?.() || [];

  // Financial summary
  const currentYear  = new Date().getFullYear();
  const ytdDonations = donations.filter(d => (d.date || '').startsWith(currentYear));
  const ytdTotal     = ytdDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const uniqueDonors = new Set(ytdDonations.map(d => d.contactId)).size;

  // Active productions
  const ACTIVE_STATUSES = ['active','in rehearsal','in production','tech week','running','open'];
  const activeProds = productions.filter(p =>
    ACTIVE_STATUSES.includes((p.status || '').toLowerCase())
  );

  // Board members
  const BOARD_TAGS = ['board', 'board member', 'board of directors', 'trustee', 'governor'];
  const boardMembers = contacts.filter(c =>
    Array.isArray(c.tags) && c.tags.some(t => BOARD_TAGS.includes(String(t).toLowerCase()))
  );

  // Upcoming shows / auditions / performances
  const today = new Date();
  const upcomingShows = productions
    .flatMap(p =>
      (p.calendar || []).map(ev => ({
        ...ev,
        productionTitle: p.title,
        productionId: p.id,
        _date: new Date(ev.start || ev.date || ev.datetime),
      }))
    )
    .filter(ev =>
      !isNaN(ev._date) && ev._date >= today &&
      ['show', 'audition', 'performance'].some(t => (ev.type || '').toLowerCase().includes(t))
    )
    .sort((a, b) => a._date - b._date)
    .slice(0, 6);

  const fmt = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kpis = [
    { label: 'Active Productions', value: activeProds.length,   icon: '🎭' },
    { label: 'YTD Donations',       value: fmt(ytdTotal),        icon: '💰' },
    { label: 'Unique Donors',       value: uniqueDonors,         icon: '🤝' },
    { label: 'Board Members',       value: boardMembers.length,  icon: '👥' },
  ];

  const runway = window.runwayService?.computeRunway?.(runwaySettings) || { hasData: false, status: 'unknown', weeksOfRunway: null, monthsOfRunway: null, weeklyBurn: 0, cashOnHand: 0 };

  const RUNWAY_STATUS_STYLES = {
    critical: { border: 'border-red-600',    bg: 'bg-red-950/40',    text: 'text-red-400',    label: 'Critical — under 3 months' },
    caution:  { border: 'border-amber-600',  bg: 'bg-amber-950/30',  text: 'text-amber-400',  label: 'Caution — under 6 months' },
    healthy:  { border: 'border-green-600',  bg: 'bg-green-950/30',  text: 'text-green-400',  label: 'Healthy' },
    unknown:  { border: 'border-gray-700',   bg: 'bg-gray-800/40',   text: 'text-gray-400',   label: 'No data yet' }
  };
  const runwayStyle = RUNWAY_STATUS_STYLES[runway.status] || RUNWAY_STATUS_STYLES.unknown;

  const handleRunwayFieldChange = (field, value) => {
    setRunwayForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRunwaySave = () => {
    const saved = window.runwayService?.saveSettings?.({
      cashOnHand: parseFloat(runwayForm.cashOnHand) || 0,
      monthlyOperatingExpense: parseFloat(runwayForm.monthlyOperatingExpense) || 0,
      monthlyContributedIncome: parseFloat(runwayForm.monthlyContributedIncome) || 0
    });
    if (saved) setRunwaySettings(saved);
    setIsEditingRunway(false);
  };

  const handleRunwayCancel = () => {
    setRunwayForm(runwaySettings);
    setIsEditingRunway(false);
  };

  const runwayCard = React.createElement('div', {
    className: `rounded-lg p-6 border-2 ${runwayStyle.border} ${runwayStyle.bg} banquo-card`
  },
    React.createElement('div', { className: 'flex items-start justify-between gap-4 flex-wrap' },
      React.createElement('div', null,
        React.createElement('div', { className: 'text-sm font-semibold uppercase tracking-wide mb-1', style: { color: 'var(--color-text-secondary)' } }, 'Weeks of Runway'),
        !runway.hasData
          ? React.createElement('div', { className: 'text-xl font-bold', style: { color: 'var(--color-text-primary)' } }, 'Add your numbers to see your runway')
          : React.createElement('div', { className: `text-4xl font-bold ${runwayStyle.text}` },
              runway.weeksOfRunway === Infinity
                ? 'Income covers expenses'
                : `${Math.max(0, Math.round(runway.weeksOfRunway))} weeks`
            ),
        runway.hasData && runway.weeksOfRunway !== Infinity && React.createElement('div', { className: 'text-sm mt-1', style: { color: 'var(--color-text-secondary)' } },
          `About ${runway.monthsOfRunway.toFixed(1)} months · ${runwayStyle.label}`
        ),
        runway.hasData && React.createElement('div', { className: 'text-xs mt-2', style: { color: 'var(--color-text-secondary)' } },
          `${fmt(runway.cashOnHand)} cash on hand · ${fmt(Math.max(0, runway.weeklyBurn))}/week net burn`
        ),
        !runway.hasData && React.createElement('div', { className: 'text-sm mt-1', style: { color: 'var(--color-text-secondary)' } },
          'How many weeks could you operate if ticket and donation income stopped tomorrow?'
        )
      ),
      React.createElement('button', {
        type: 'button',
        onClick: () => setIsEditingRunway(v => !v),
        className: 'text-xs px-3 py-1.5 rounded border banquo-card--flat shrink-0',
        style: { color: 'var(--color-text-primary)', borderColor: 'var(--color-border, #374151)' }
      }, isEditingRunway ? 'Cancel' : (runway.hasData ? 'Update numbers' : 'Add numbers'))
    ),

    isEditingRunway && React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4' },
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-xs font-medium mb-1', style: { color: 'var(--color-text-secondary)' } }, 'Cash on Hand'),
        React.createElement('input', {
          type: 'number',
          value: runwayForm.cashOnHand,
          onChange: (e) => handleRunwayFieldChange('cashOnHand', e.target.value),
          className: 'w-full px-3 py-2 border border-gray-600 rounded bg-transparent',
          style: { color: 'var(--color-text-primary)' },
          placeholder: '0.00',
          step: '0.01'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-xs font-medium mb-1', style: { color: 'var(--color-text-secondary)' } }, 'Monthly Operating Expenses'),
        React.createElement('input', {
          type: 'number',
          value: runwayForm.monthlyOperatingExpense,
          onChange: (e) => handleRunwayFieldChange('monthlyOperatingExpense', e.target.value),
          className: 'w-full px-3 py-2 border border-gray-600 rounded bg-transparent',
          style: { color: 'var(--color-text-primary)' },
          placeholder: '0.00',
          step: '0.01'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-xs font-medium mb-1', style: { color: 'var(--color-text-secondary)' } }, 'Monthly Contributed / Earned Income'),
        React.createElement('input', {
          type: 'number',
          value: runwayForm.monthlyContributedIncome,
          onChange: (e) => handleRunwayFieldChange('monthlyContributedIncome', e.target.value),
          className: 'w-full px-3 py-2 border border-gray-600 rounded bg-transparent',
          style: { color: 'var(--color-text-primary)' },
          placeholder: '0.00',
          step: '0.01'
        })
      ),
      React.createElement('div', { className: 'md:col-span-3 flex gap-2' },
        React.createElement('button', {
          type: 'button',
          onClick: handleRunwaySave,
          className: 'px-4 py-2 rounded font-medium text-sm',
          style: { backgroundColor: 'var(--btn-primary-bg, #7a1f24)', color: 'var(--btn-primary-text, #f4ede2)' }
        }, 'Save'),
        React.createElement('button', {
          type: 'button',
          onClick: handleRunwayCancel,
          className: 'px-4 py-2 rounded font-medium text-sm border border-gray-600',
          style: { color: 'var(--color-text-primary)' }
        }, 'Cancel')
      )
    )
  );

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  return React.createElement('div', { className: 'bg-base min-h-screen' },
  React.createElement('div', { className: 'max-w-[1400px] mx-auto p-6 space-y-6' },

    // Header
    React.createElement('div', { className: 'mb-2' },
      React.createElement('h1', { className: 'text-3xl font-bold mb-1', style: { color: 'var(--color-text-primary)' } }, '🏛️ Board Dashboard'),
      React.createElement('p', { style: { color: 'var(--color-text-secondary)' } },
        new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      )
    ),

    runwayCard,

    atRiskProductions.length > 0 && React.createElement('div', {
      className: 'rounded-lg p-6 border-2 border-red-600 bg-red-950/40 banquo-card'
    },
      React.createElement('div', { className: 'text-sm font-semibold uppercase tracking-wide mb-3', style: { color: 'var(--color-text-secondary)' } }, '⚠️ Productions at Risk'),
      React.createElement('div', { className: 'space-y-2' },
        ...atRiskProductions.map(p =>
          React.createElement('div', {
            key: p.productionId,
            className: 'flex items-center justify-between p-3 bg-gray-750 rounded border border-gray-600 cursor-pointer hover:border-red-500 transition-colors banquo-card--flat',
            onClick: () => { window.location.hash = `#/productions/${p.productionId}`; }
          },
            React.createElement('div', { className: 'font-medium', style: { color: 'var(--color-text-primary)' } }, p.productionTitle),
            React.createElement('div', { className: 'text-xs text-red-400 font-semibold' },
              p.current.breakEvenWeeks === Infinity
                ? 'Won\'t recoup costs'
                : `Breaks even in ${Math.round(p.current.breakEvenWeeks)} wks (run is ${p.weeksInRun} wks)`
            )
          )
        )
      )
    ),

    // KPI row
    React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4' },
      ...kpis.map(kpi =>
        React.createElement('div', {
          key: kpi.label,
          className: 'bg-surface rounded-lg p-5 border border-gray-700 banquo-card'
        },
          React.createElement('div', { className: 'text-3xl font-bold mb-1', style: { color: 'var(--color-text-primary)' } }, kpi.value),
          React.createElement('div', { className: 'text-sm', style: { color: 'var(--color-text-secondary)' } }, kpi.label)
        )
      )
    ),

    // Main grid
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },

      // Active Productions
      React.createElement('div', { className: 'bg-surface rounded-lg p-5 border border-gray-700 banquo-card' },
        React.createElement('h3', { className: 'text-lg font-semibold mb-4', style: { color: 'var(--color-text-primary)' } }, '🎬 Active Productions'),
        activeProds.length === 0
          ? React.createElement('p', { className: 'text-sm italic', style: { color: 'var(--color-text-secondary)' } }, 'No active productions')
          : React.createElement('div', { className: 'space-y-2' },
              ...activeProds.map(prod => {
                const budget = parseFloat(prod.overallBudget) || 0;
                const spent = (prod.scenes || [])
                  .flatMap(s => [...(s.props?.items || []), ...(s.wardrobe?.items || [])])
                  .reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
                return React.createElement('div', {
                  key: prod.id,
                  className: 'flex items-center justify-between p-3 bg-gray-750 rounded border border-gray-600 cursor-pointer hover:border-violet-600 transition-colors banquo-card--flat',
                  onClick: () => { window.location.hash = `#/productions/${prod.id}`; }
                },
                  React.createElement('div', null,
                    React.createElement('div', { className: 'font-medium', style: { color: 'var(--color-text-primary)' } }, prod.title),
                    React.createElement('div', { className: 'text-xs', style: { color: 'var(--color-text-secondary)' } }, prod.status || 'Active')
                  ),
                  budget > 0 && React.createElement('div', { className: 'text-right' },
                    React.createElement('div', { className: 'text-xs', style: { color: 'var(--color-text-secondary)' } }, 'Budget'),
                    React.createElement('div', {
                      className: `text-xs font-medium ${spent > budget ? 'text-red-400' : 'text-green-400'}`
                    }, `$${budget.toLocaleString()}`)
                  )
                );
              })
            )
      ),

      // Upcoming Shows & Auditions
      React.createElement('div', { className: 'bg-surface rounded-lg p-5 border border-gray-700 banquo-card' },
        React.createElement('h3', { className: 'text-lg font-semibold mb-4', style: { color: 'var(--color-text-primary)' } }, '📅 Upcoming Shows & Auditions'),
        upcomingShows.length === 0
          ? React.createElement('p', { className: 'text-sm italic', style: { color: 'var(--color-text-secondary)' } }, 'No upcoming shows or auditions')
          : React.createElement('div', { className: 'space-y-2' },
              ...upcomingShows.map((ev, idx) =>
                React.createElement('div', {
                  key: ev.id || idx,
                  className: 'flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors',
                  onClick: () => { window.location.hash = `#/productions/${ev.productionId}?tab=calendar`; }
                },
                  React.createElement('div', {
                    className: 'text-xs text-center bg-gray-700 rounded px-2 py-1 min-w-[44px] shrink-0'
                  },
                    React.createElement('div', { className: 'uppercase', style: { color: 'var(--color-text-muted)' } },
                      ev._date.toLocaleString('default', { month: 'short' })
                    ),
                    React.createElement('div', { className: 'font-bold text-base', style: { color: 'var(--color-text-primary)' } },
                      ev._date.getDate()
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-sm font-medium', style: { color: 'var(--color-text-primary)' } },
                      ev.title || ev.type
                    ),
                    React.createElement('div', { className: 'text-xs', style: { color: 'var(--color-text-secondary)' } }, ev.productionTitle)
                  )
                )
              )
            )
      ),

      // Financial Summary
      React.createElement('div', { className: 'bg-surface rounded-lg p-5 border border-gray-700 banquo-card' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('h3', { className: 'text-lg font-semibold', style: { color: 'var(--color-text-primary)' } }, '💰 Financial Summary'),
          React.createElement('button', {
            type: 'button',
            onClick: () => { window.location.hash = '#/financial'; },
            className: 'text-xs text-violet-400 hover:text-violet-300 underline'
          }, 'View full dashboard →')
        ),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-sm', style: { color: 'var(--color-text-secondary)' } }, `${currentYear} Donations`),
            React.createElement('span', { className: 'text-green-400 font-semibold' }, fmt(ytdTotal))
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-sm', style: { color: 'var(--color-text-secondary)' } }, 'Total Gifts'),
            React.createElement('span', { className: 'font-semibold', style: { color: 'var(--color-text-primary)' } }, ytdDonations.length)
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-sm', style: { color: 'var(--color-text-secondary)' } }, 'Unique Donors'),
            React.createElement('span', { className: 'font-semibold', style: { color: 'var(--color-text-primary)' } }, uniqueDonors)
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-sm', style: { color: 'var(--color-text-secondary)' } }, 'All-Time Total'),
            React.createElement('span', { className: 'font-semibold', style: { color: 'var(--color-text-primary)' } },
              fmt(donations.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0))
            )
          )
        )
      ),

      // Board Members
      React.createElement('div', { className: 'bg-surface rounded-lg p-5 border border-gray-700 banquo-card' },
        React.createElement('h3', { className: 'text-lg font-semibold mb-4', style: { color: 'var(--color-text-primary)' } }, '👥 Board Members'),
        boardMembers.length === 0
          ? React.createElement('p', { className: 'text-sm italic', style: { color: 'var(--color-text-secondary)' } }, 'No board members tagged yet. Tag contacts with "board member" in the Contacts hub.')
          : React.createElement('div', { className: 'space-y-2' },
              ...boardMembers.slice(0, 6).map(m => {
                const name = m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || '?';
                const initial = name[0].toUpperCase();
                return React.createElement('div', {
                  key: m.id,
                  className: 'flex items-center gap-3 banquo-card--flat'
                },
                  React.createElement('div', {
                    className: 'w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-bold shrink-0'
                  }, initial),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-sm font-medium', style: { color: 'var(--color-text-primary)' } }, name),
                    m.email && React.createElement('div', { className: 'text-xs', style: { color: 'var(--color-text-secondary)' } }, m.email)
                  )
                );
              }),
              boardMembers.length > 6 && React.createElement('p', {
                className: 'text-xs pt-1', style: { color: 'var(--color-text-secondary)' }
              }, `+${boardMembers.length - 6} more board members`)
            )
      )
    )
  ));
};

window.BoardDashboard = BoardDashboard;
console.log('✅ BoardDashboard loaded');
