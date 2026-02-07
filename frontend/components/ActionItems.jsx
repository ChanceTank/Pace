const { useState, useEffect } = React;
const apiCall = window.apiCall;

function ActionItems({ apiUrl }) {
  const [actionItems, setActionItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    checkin_id: '',
    person_id: '',
    description: '',
    due_date: '',
    status: 'Pending'
  });

  useEffect(() => {
    loadActionItems();
    loadPeople();
    loadCheckins();
  }, []);

  const loadActionItems = async () => {
    try {
      const data = await apiCall('/action_items');
      setActionItems(data);
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  };

  const loadPeople = async () => {
    try {
      const data = await apiCall('/people');
      setPeople(data);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadCheckins = async () => {
    try {
      const data = await apiCall('/checkins');
      setCheckins(data);
    } catch (error) {
      console.error('Error loading checkins:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/action_items/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/action_items', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        checkin_id: '',
        person_id: '',
        description: '',
        due_date: '',
        status: 'Pending'
      });
      loadActionItems();
    } catch (error) {
      console.error('Error saving action item:', error);
    }
  };

  const handleEdit = (actionItem) => {
    setEditing(actionItem.id);
    setFormData({
      checkin_id: actionItem.checkin_id || '',
      person_id: actionItem.person_id,
      description: actionItem.description,
      due_date: actionItem.due_date || '',
      status: actionItem.status
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      try {
        await apiCall(`/action_items/${id}`, { method: 'DELETE' });
        loadActionItems();
      } catch (error) {
        console.error('Error deleting action item:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      checkin_id: '',
      person_id: '',
      description: '',
      due_date: '',
      status: 'Pending'
    });
  };

  const getPersonName = (personId) => {
    const person = people.find(p => p.id === personId);
    return person ? person.name : 'Unknown';
  };

  return (
    <div className="entity-container">
      <h2>Action Items</h2>
      <form onSubmit={handleSubmit} className="entity-form">
        <select
          value={formData.person_id}
          onChange={(e) => setFormData({...formData, person_id: e.target.value})}
          required
        >
          <option value="">Select Person</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        <select
          value={formData.checkin_id}
          onChange={(e) => setFormData({...formData, checkin_id: e.target.value})}
        >
          <option value="">Select Checkin (optional)</option>
          {checkins.map(checkin => (
            <option key={checkin.id} value={checkin.id}>
              Checkin with {getPersonName(checkin.person_id)} ({new Date(checkin.creation_date).toLocaleDateString()})
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          rows="3"
        />
        <input
          type="date"
          placeholder="Due Date"
          value={formData.due_date}
          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Action Item</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {actionItems.map(actionItem => (
          <div key={actionItem.id} className="entity-item">
            <div className="entity-info">
              <h3>{actionItem.description}</h3>
              <p>Person: {getPersonName(actionItem.person_id)}</p>
              <p>Due Date: {actionItem.due_date || 'N/A'}</p>
              <p>Status: {actionItem.status}</p>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(actionItem)}>Edit</button>
              <button onClick={() => handleDelete(actionItem.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


