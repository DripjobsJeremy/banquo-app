(function (global) {
  'use strict';

  const STORAGE_KEY = 'showsuite_notifications';

  const generateId = () => 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const loadAll = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('notificationsService: Error loading notifications:', error);
      return [];
    }
  };

  const saveAll = (notifications) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (error) {
      console.error('notificationsService: Error saving notifications:', error);
    }
  };

  const create = (data) => {
    const notifications = loadAll();
    const notification = {
      id: generateId(),
      contactId: data.contactId,
      contactName: data.contactName || '',
      icon: data.icon || '🎭',
      eventId: data.eventId || null,
      eventTitle: data.eventTitle || '',
      eventDate: data.eventDate || '',
      productionId: data.productionId || null,
      productionTitle: data.productionTitle || '',
      invitedByName: data.invitedByName || 'Someone',
      invitedByRole: data.invitedByRole || '',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(notification);
    saveAll(notifications);
    return notification;
  };

  const getForContact = (contactId) => {
    return loadAll()
      .filter(n => n.contactId === contactId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getAll = () => {
    return loadAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getUnreadCountForContact = (contactId) => {
    return loadAll().filter(n => n.contactId === contactId && !n.read).length;
  };

  const markRead = (notificationId) => {
    const notifications = loadAll();
    const idx = notifications.findIndex(n => n.id === notificationId);
    if (idx === -1) return null;
    notifications[idx] = { ...notifications[idx], read: true };
    saveAll(notifications);
    return notifications[idx];
  };

  const markAllReadForContact = (contactId) => {
    const notifications = loadAll().map(n => n.contactId === contactId ? { ...n, read: true } : n);
    saveAll(notifications);
  };

  const getUnreadCountSince = (isoTimestamp) => {
    if (!isoTimestamp) return loadAll().length;
    return loadAll().filter(n => new Date(n.createdAt) > new Date(isoTimestamp)).length;
  };

  global.notificationsService = {
    create,
    getForContact,
    getAll,
    getUnreadCountForContact,
    markRead,
    markAllReadForContact,
    getUnreadCountSince
  };
})(window);
