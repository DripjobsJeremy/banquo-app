function DepartmentCalendar() {
  const userRole = localStorage.getItem('showsuite_user_role') || '';
  const currentUser = window.usersService?.getCurrentUser?.();

  // Normalize short role IDs → long form for dept lookups
  const ROLE_MAP = {
    lighting:      'lighting_designer',
    sound:         'sound_designer',
    wardrobe:      'wardrobe_designer',
    props:         'props_master',
    set:           'scenic_designer',
    stage_manager: 'stage_manager',
  };
  const ROLE_LABELS = {
    lighting:      'Lighting Designer',
    sound:         'Sound Designer',
    wardrobe:      'Wardrobe Designer',
    props:         'Props Manager',
    set:           'Set Designer',
    stage_manager: 'Stage Manager',
  };
  const effectiveRole = ROLE_MAP[userRole] || userRole;
  const FULL_ACCESS_ROLES = ['admin', 'director', 'stage_manager'];

  // Event types each dept role can see (plus always-visible types below)
  const DEPT_ALLOWED = {
    lighting_designer: ['deadline', 'meeting'],
    sound_designer:    ['deadline', 'meeting'],
    wardrobe_designer: ['costume-fitting', 'deadline', 'meeting'],
    props_master:      ['deadline', 'meeting'],
    scenic_designer:   ['build', 'deadline', 'meeting'],
  };

  // Types always visible to everyone (production-wide events)
  const ALWAYS_VISIBLE = ['rehearsal', 'tech-rehearsal', 'performance', 'show', 'opening-night'];

  const isEventVisible = (event) => {
    if (FULL_ACCESS_ROLES.includes(effectiveRole)) return true;
    const type = (event.type || '').toLowerCase();
    if (ALWAYS_VISIBLE.includes(type)) return true;
    const allowed = DEPT_ALLOWED[effectiveRole] || [];
    return allowed.includes(type);
  };

  // Load assigned productions
  const assignedProductions = React.useMemo(() => {
    const allProductions = window.productionsService?.getAll?.() || [];
    const assigned = currentUser?.assignedProductions || [];
    if (!assigned.length) return [];
    return allProductions.filter(p => assigned.includes(p.id));
  }, []);

  // Load + aggregate events from all assigned productions
  const allEvents = React.useMemo(() => {
    const events = [];
    assignedProductions.forEach(prod => {
      try {
        const raw = localStorage.getItem(`calendar_events_${prod.id}`);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        parsed.forEach(evt => {
          if (!evt) return;
          // Normalise start field
          let start = evt.start;
          if (!start && evt.date) {
            const dateStr = typeof evt.date === 'string' ? evt.date : new Date(evt.date).toISOString().split('T')[0];
            const timeStr = evt.startTime || evt.time || '00:00';
            start = `${dateStr}T${timeStr}:00`;
          }
          if (!start) return;
          if (isEventVisible(evt)) {
            events.push({ ...evt, start, productionId: prod.id, productionTitle: prod.title || prod.name || 'Production' });
          }
        });
      } catch (e) {
        console.warn('DepartmentCalendar: failed to parse events for', prod.id, e);
      }
    });
    // Sort by start date ascending
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    return events;
  }, [assignedProductions]);

  const [viewMode, setViewMode] = React.useState('month');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  // ─── Event type styling ──────────────────────────────────────────────────
  const EVENT_COLORS = {
    rehearsal:       'bg-blue-100 text-blue-800 border-blue-200',
    'tech-rehearsal':'bg-purple-100 text-purple-800 border-purple-200',
    performance:     'bg-green-100 text-green-800 border-green-200',
    show:            'bg-green-100 text-green-800 border-green-200',
    'opening-night': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    meeting:         'bg-orange-100 text-orange-800 border-orange-200',
    deadline:        'bg-red-100 text-red-800 border-red-200',
    build:           'bg-amber-100 text-amber-800 border-amber-200',
    'costume-fitting':'bg-pink-100 text-pink-800 border-pink-200',
  };
  const eventColor = (type) => EVENT_COLORS[(type || '').toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  // ─── Month view helpers ───────────────────────────────────────────────────
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const eventsOnDate = (dateStr) => allEvents.filter(e => e.start?.startsWith(dateStr));

  const monthYear = currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  // ─── List view: upcoming events ──────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = allEvents.filter(e => new Date(e.start) >= today);

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (!assignedProductions.length) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Productions Assigned</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't been assigned to any productions yet. Contact your admin to be added to a production.
          </p>
        </div>
      </div>
    );
  }

  // ─── Event detail popover ─────────────────────────────────────────────────
  const EventPopover = ({ event, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border mb-2 ${eventColor(event.type)}`}>
              {event.type || 'Event'}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">{event.title || event.type || 'Event'}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">✕</button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatDate(event.start)}</span>
          </div>
          {formatTime(event.start) && (
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>
                {formatTime(event.start)}
                {event.end ? ` – ${formatTime(event.end)}` : ''}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.productionTitle && (
            <div className="flex items-center gap-2">
              <span>🎬</span>
              <span>{event.productionTitle}</span>
            </div>
          )}
          {event.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-500 italic">{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          {ROLE_LABELS[userRole] || 'Department'} · {assignedProductions.length} production{assignedProductions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Navigation (month view only) */}
        {viewMode === 'month' ? (
          <div className="flex items-center gap-3">
            <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Previous month">‹</button>
            <span className="text-lg font-semibold text-gray-800 w-44 text-center">{monthYear}</span>
            <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Next month">›</button>
          </div>
        ) : (
          <div>
            <span className="text-lg font-semibold text-gray-800">Upcoming Events</span>
          </div>
        )}

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 ${viewMode === 'month' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Production legend */}
      {assignedProductions.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {assignedProductions.map(p => (
            <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 border border-violet-200 rounded text-xs text-violet-700">
              🎬 {p.title || p.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Month View ── */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50 opacity-50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsOnDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day}
                  className={`min-h-[80px] border-b border-r border-gray-100 p-1 ${isToday ? 'bg-violet-50' : 'bg-white'}`}
                >
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-violet-600 text-white' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left px-1 py-0.5 rounded text-xs truncate border ${eventColor(evt.type)} hover:opacity-80 transition-opacity`}
                        title={evt.title || evt.type}
                      >
                        {evt.title || evt.type}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(dayEvents[3])}
                        className="w-full text-left px-1 text-xs text-gray-400 hover:text-gray-600"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🗓️</div>
              <p>No upcoming events for your assigned productions.</p>
            </div>
          ) : (
            upcomingEvents.map((evt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedEvent(evt)}
                className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-violet-300 hover:shadow-sm transition-all flex items-start gap-4"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 text-center w-12">
                  <div className="text-xs text-gray-400 uppercase">
                    {new Date(evt.start).toLocaleDateString([], { month: 'short' })}
                  </div>
                  <div className="text-xl font-bold text-gray-900 leading-tight">
                    {new Date(evt.start).getDate()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(evt.start).toLocaleDateString([], { weekday: 'short' })}
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${eventColor(evt.type)}`}>
                      {evt.type || 'Event'}
                    </span>
                    <span className="text-xs text-gray-400">{evt.productionTitle}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{evt.title || evt.type || 'Event'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {formatTime(evt.start) && <span>⏰ {formatTime(evt.start)}{evt.end ? ` – ${formatTime(evt.end)}` : ''}</span>}
                    {evt.location && <span>📍 {evt.location}</span>}
                  </div>
                </div>

                <div className="text-gray-300 flex-shrink-0">›</div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Event detail popover */}
      {selectedEvent && (
        <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

window.DepartmentCalendar = DepartmentCalendar;
console.log('✅ DepartmentCalendar loaded');
