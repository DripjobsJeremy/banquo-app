const { useState, useEffect } = React;

function CrewList({ production, onUpdate }) {
  const [crew, setCrew] = useState(production?.crew || []);
  const [contacts, setContacts] = useState([]);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addingForCrewId, setAddingForCrewId] = useState(null);
  const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('showsuite_crew_list_collapsed');
    return saved === 'true';
  });

  const loadContacts = () => {
    const list = window.contactsService?.loadContacts?.() || [];
    setContacts(list);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setCrew(production?.crew || []);
  }, [production?.crew]);

  useEffect(() => {
    localStorage.setItem('showsuite_crew_list_collapsed', isCollapsed);
  }, [isCollapsed]);

  const getContactName = (c) => {
    if (c.firstName || c.lastName) return `${c.firstName || ''} ${c.lastName || ''}`.trim();
    return c.name || c.displayName || 'Unknown';
  };

  const handleAddCrewMember = () => {
    const newMember = {
      id: 'crew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      role: '',
      contactId: null
    };

    const updated = [...crew, newMember];
    setCrew(updated);

    console.log('👷 Adding new crew member');

    if (onUpdate) {
      onUpdate({ ...production, crew: updated });
      console.log('✓ Production saved with new crew member');
    }
  };

  const handleUpdateRole = (crewId, value) => {
    const updated = crew.map(member =>
      member.id === crewId ? { ...member, role: value } : member
    );
    setCrew(updated);

    if (onUpdate) {
      onUpdate({ ...production, crew: updated });
      console.log('✓ Production saved with updated crew role');
    }
  };

  const handleAssignContact = (crewId, contactId) => {
    const updated = crew.map(member =>
      member.id === crewId ? { ...member, contactId: contactId || null } : member
    );
    setCrew(updated);

    console.log('👷 Assigning contact to crew role:', { crewId, contactId: contactId || null });

    if (onUpdate) {
      onUpdate({ ...production, crew: updated });
      console.log('✓ Production saved with updated crew assignment');
    } else {
      console.error('⚠️ onUpdate callback not provided to CrewList');
    }
  };

  const handleDeleteCrewMember = (crewId) => {
    if (!confirm('Delete this crew member?')) return;

    const deleted = crew.find(m => m.id === crewId);
    const updated = crew.filter(m => m.id !== crewId);
    setCrew(updated);

    console.log('👷 Deleting crew member:', deleted?.role);

    if (onUpdate) {
      onUpdate({ ...production, crew: updated });
      console.log('✓ Production saved after crew member deletion');
    }
  };

  const openAddPerson = (crewId) => {
    setAddingForCrewId(crewId);
    setNewPerson({ firstName: '', lastName: '', email: '', phone: '' });
    setShowAddPersonModal(true);
  };

  const handleAddPerson = () => {
    if (!newPerson.firstName || !newPerson.lastName) {
      alert('Please enter first and last name');
      return;
    }

    const newContact = {
      id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      firstName: newPerson.firstName,
      lastName: newPerson.lastName,
      email: newPerson.email || '',
      phone: newPerson.phone || '',
      groups: ['Crew'],
      type: 'Crew',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = window.contactsService?.loadContacts?.() || [];
    window.contactsService?.saveContactsToLS?.([...existing, newContact]);

    loadContacts();

    if (addingForCrewId) {
      handleAssignContact(addingForCrewId, newContact.id);
    }

    setNewPerson({ firstName: '', lastName: '', email: '', phone: '' });
    setShowAddPersonModal(false);
    setAddingForCrewId(null);

    alert(`✓ Added ${newContact.firstName} ${newContact.lastName} to Contacts`);
  };

  const assignedCount = crew.filter(m => m.contactId).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={isCollapsed ? 'Expand Crew' : 'Collapse Crew'}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
          <h3 className="text-lg font-semibold text-gray-900">👷 Crew</h3>
          {isCollapsed && (
            <span className="text-sm text-gray-600">
              ({assignedCount} of {crew.length} roles filled)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddCrewMember}
            className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
          >
            + Add Crew Member
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {crew.length > 0 && (
            <div className="flex items-center gap-3 mb-2 px-3 pb-2 border-b border-gray-200">
              <div className="crew-list-role-col">
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">ROLE</span>
              </div>
              <div className="crew-list-contact-col">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">ASSIGNED TO</span>
              </div>
              <div className="cast-list-actions-spacer"></div>
            </div>
          )}

          {crew.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No crew roles defined yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "+ Add Crew Member" to start building your backstage team</p>
            </div>
          ) : (
            <div className="space-y-2">
              {crew.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="crew-list-role-col flex items-center">
                    <div className="w-1 h-8 bg-violet-400 rounded-full mr-3"></div>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      placeholder="e.g., Stage Hand, Board Op"
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  <div className="crew-list-contact-col flex items-center">
                    <div className="w-1 h-8 bg-emerald-400 rounded-full mr-3"></div>
                    <select
                      value={member.contactId || ''}
                      onChange={(e) => handleAssignContact(member.id, e.target.value)}
                      className="cast-list-actor-select px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">-- Select Person --</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{getContactName(c)}</option>
                      ))}
                    </select>
                  </div>

                  {member.contactId ? (
                    <span className="cast-list-badge px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ✓ Assigned
                    </span>
                  ) : (
                    <span className="cast-list-badge px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                      Unassigned
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => openAddPerson(member.id)}
                    title="Add new person to contact database"
                    className="cast-list-delete p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    ＋
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCrewMember(member.id)}
                    title="Delete crew member"
                    className="cast-list-delete p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          {crew.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">
                {assignedCount} of {crew.length} role{crew.length !== 1 ? 's' : ''} filled
              </span>
              {assignedCount < crew.length && (
                <span className="text-amber-600 font-medium">
                  {crew.length - assignedCount} role{(crew.length - assignedCount) !== 1 ? 's' : ''} unfilled
                </span>
              )}
            </div>
          )}
        </>
      )}

      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowAddPersonModal(false); setAddingForCrewId(null); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Person</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newPerson.firstName}
                  onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })}
                  placeholder="First name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <input
                  type="text"
                  value={newPerson.lastName}
                  onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })}
                  placeholder="Last name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <input
                type="email"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <input
                type="tel"
                value={newPerson.phone}
                onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowAddPersonModal(false); setAddingForCrewId(null); }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPerson}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Person
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CrewList = CrewList;
