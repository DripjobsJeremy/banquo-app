const { useState, useEffect } = React;

const DEPARTMENTS = [
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'sound', name: 'Sound', icon: '🔊' },
  { id: 'wardrobe', name: 'Wardrobe', icon: '👔' },
  { id: 'props', name: 'Props', icon: '🎭' },
  { id: 'set', name: 'Set Design', icon: '🎨' },
];

function DepartmentManagersPanel({ production, onUpdate }) {
  const [managers, setManagers] = useState(production?.departmentManagers || {});
  const [contacts, setContacts] = useState([]);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addingForDept, setAddingForDept] = useState(null);
  const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const loadContacts = () => {
    const list = window.contactsService?.loadContacts?.() || [];
    setContacts(list);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setManagers(production?.departmentManagers || {});
  }, [production?.departmentManagers]);

  const getContactName = (c) => {
    if (c.firstName || c.lastName) return `${c.firstName || ''} ${c.lastName || ''}`.trim();
    return c.name || c.displayName || 'Unknown';
  };

  const handleAssignManager = (deptId, contactId) => {
    let updatedManagers;
    if (!contactId) {
      updatedManagers = { ...managers, [deptId]: null };
    } else {
      const contact = contacts.find(c => c.id === contactId);
      updatedManagers = {
        ...managers,
        [deptId]: contact ? {
          contactId: contact.id,
          name: getContactName(contact),
          email: contact.email || '',
          phone: contact.phone || '',
        } : null,
      };
    }
    setManagers(updatedManagers);

    console.log('🗂️ Assigning department manager:', { deptId, contactId });

    if (onUpdate) {
      onUpdate({ ...production, departmentManagers: updatedManagers });
      console.log('✓ Production saved with updated department managers');
    }
  };

  const openAddPerson = (deptId) => {
    setAddingForDept(deptId);
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
      groups: ['Staff'],
      type: 'Staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = window.contactsService?.loadContacts?.() || [];
    window.contactsService?.saveContactsToLS?.([...existing, newContact]);

    loadContacts();

    if (addingForDept) {
      handleAssignManager(addingForDept, newContact.id);
    }

    setNewPerson({ firstName: '', lastName: '', email: '', phone: '' });
    setShowAddPersonModal(false);
    setAddingForDept(null);

    alert(`✓ Added ${newContact.firstName} ${newContact.lastName} to Contacts`);
  };

  return (
    <div className="space-y-2">
      {DEPARTMENTS.map(dept => {
        const assigned = managers[dept.id];
        return (
          <div key={dept.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 dept-manager-label-col">
              <span className="text-lg">{dept.icon}</span>
              <span className="font-medium text-gray-900">{dept.name}</span>
            </div>
            <select
              value={assigned?.contactId || ''}
              onChange={(e) => handleAssignManager(dept.id, e.target.value)}
              className="dept-manager-select px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">-- Unassigned --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{getContactName(c)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => openAddPerson(dept.id)}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              title="Add new person to contact database"
            >
              + Add Person
            </button>
          </div>
        );
      })}

      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowAddPersonModal(false); setAddingForDept(null); }}>
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
                onClick={() => { setShowAddPersonModal(false); setAddingForDept(null); }}
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

window.DepartmentManagersPanel = DepartmentManagersPanel;
