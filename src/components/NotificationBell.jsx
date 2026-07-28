const { useState, useEffect } = React;

function NotificationBell({ mode, contactId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const SEEN_KEY = 'showsuite_staff_notifications_seen_at';

  const loadNotifications = () => {
    if (!window.notificationsService) return;
    if (mode === 'personal') {
      if (!contactId) { setNotifications([]); setUnreadCount(0); return; }
      const list = window.notificationsService.getForContact(contactId);
      setNotifications(list);
      setUnreadCount(window.notificationsService.getUnreadCountForContact(contactId));
    } else {
      const list = window.notificationsService.getAll();
      setNotifications(list);
      const seenAt = localStorage.getItem(SEEN_KEY);
      setUnreadCount(window.notificationsService.getUnreadCountSince(seenAt));
    }
  };

  useEffect(() => {
    loadNotifications();
    const handler = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handler);
    return () => window.removeEventListener('notificationsUpdated', handler);
  }, [mode, contactId]);

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatEventDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleToggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && mode === 'staff') {
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (notification) => {
    if (mode === 'personal' && !notification.read) {
      window.notificationsService.markRead(notification.id);
      loadNotifications();
    }
  };

  return (
    <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 60 }}>
      <button
        type="button"
        onClick={handleToggle}
        title="Notifications"
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '9999px',
          background: 'var(--color-bg-elevated, #fff)',
          border: '1px solid var(--color-border, #e5e7eb)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#dc2626',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 'bold',
            borderRadius: '9999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          width: '340px',
          maxHeight: '420px',
          overflowY: 'auto',
          background: 'var(--color-bg-elevated, #fff)',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border, #e5e7eb)', fontWeight: 600 }}>
            {mode === 'personal' ? 'My Notifications' : 'Notifications'}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
              No notifications yet.
            </div>
          ) : notifications.slice(0, 30).map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--color-border, #f3f4f6)',
                cursor: mode === 'personal' ? 'pointer' : 'default',
                background: (mode === 'personal' && !n.read) ? 'rgba(139, 26, 43, 0.05)' : 'transparent'
              }}
            >
              <div style={{ fontSize: '13px' }}>
                <span style={{ marginRight: '6px' }}>{n.icon || '🎭'}</span>
                {mode === 'staff' ? (
                  <span><strong>{n.contactName}</strong> was invited to <strong>{n.eventTitle}</strong></span>
                ) : (
                  <span>You were invited to <strong>{n.eventTitle}</strong></span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {n.productionTitle ? `${n.productionTitle} · ` : ''}{formatEventDate(n.eventDate)}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                Invited by {n.invitedByName} · {formatTimestamp(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.NotificationBell = NotificationBell;
