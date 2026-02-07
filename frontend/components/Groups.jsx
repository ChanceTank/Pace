const { useState, useEffect } = React;
const apiCall = window.apiCall;

function Groups({ apiUrl }) {
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meeting_frequency: ''
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await apiCall('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/groups/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/groups', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        name: '',
        description: '',
        meeting_frequency: ''
      });
      loadGroups();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleEdit = (group) => {
    setEditing(group.id);
    setFormData({
      name: group.name,
      description: group.description || '',
      meeting_frequency: group.meeting_frequency
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await apiCall(`/groups/${id}`, { method: 'DELETE' });
        loadGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      meeting_frequency: ''
    });
  };

  return (
    <div className="entity-container">
      <h2>Groups</h2>
      <form onSubmit={handleSubmit} className="entity-form">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
        />
        <select
          value={formData.meeting_frequency}
          onChange={(e) => setFormData({...formData, meeting_frequency: e.target.value})}
          required
        >
          <option value="">Meeting Frequency</option>
          <option value="Weekly">Weekly</option>
          <option value="Bi-weekly">Bi-weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Ad-hoc">Ad-hoc</option>
        </select>
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Group</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {groups.map(group => (
          <div key={group.id} className="entity-item">
            <div className="entity-info">
              <h3>{group.name}</h3>
              <p>Description: {group.description || 'N/A'}</p>
              <p>Meeting Frequency: {group.meeting_frequency}</p>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(group)}>Edit</button>
              <button onClick={() => handleDelete(group.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Groups = Groups;
