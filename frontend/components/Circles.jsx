const { useState, useEffect } = React;
const apiCall = window.apiCall;

function Circles({ apiUrl }) {
  const [circles, setCircles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    meeting_frequency: ''
  });

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const data = await apiCall('/circles');
      setCircles(data);
    } catch (error) {
      console.error('Error loading circles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/circles/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/circles', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        name: '',
        meeting_frequency: ''
      });
      loadCircles();
    } catch (error) {
      console.error('Error saving circle:', error);
    }
  };

  const handleEdit = (circle) => {
    setEditing(circle.id);
    setFormData({
      name: circle.name,
      meeting_frequency: circle.meeting_frequency
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this circle?')) {
      try {
        await apiCall(`/circles/${id}`, { method: 'DELETE' });
        loadCircles();
      } catch (error) {
        console.error('Error deleting circle:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: '',
      meeting_frequency: ''
    });
  };

  return (
    <div className="entity-container">
      <h2>Circles</h2>
      <form onSubmit={handleSubmit} className="entity-form">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
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
          <button type="submit">{editing ? 'Update' : 'Add'} Circle</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {circles.map(circle => (
          <div key={circle.id} className="entity-item">
            <div className="entity-info">
              <h3>{circle.name}</h3>
              <p>Meeting Frequency: {circle.meeting_frequency}</p>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(circle)}>Edit</button>
              <button onClick={() => handleDelete(circle.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Circles = Circles;
