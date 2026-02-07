const { useState, useEffect } = React;
const apiCall = window.apiCall;

function CovenantTypes({ apiUrl }) {
  const [covenantTypes, setCovenantTypes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCovenantTypes();
  }, []);

  const loadCovenantTypes = async () => {
    try {
      const data = await apiCall('/covenant_types');
      setCovenantTypes(data);
    } catch (error) {
      console.error('Error loading covenant types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/covenant_types/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/covenant_types', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        name: '',
        description: ''
      });
      loadCovenantTypes();
    } catch (error) {
      console.error('Error saving covenant type:', error);
    }
  };

  const handleEdit = (covenantType) => {
    setEditing(covenantType.id);
    setFormData({
      name: covenantType.name,
      description: covenantType.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this covenant type?')) {
      try {
        await apiCall(`/covenant_types/${id}`, { method: 'DELETE' });
        loadCovenantTypes();
      } catch (error) {
        console.error('Error deleting covenant type:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  return (
    <div className="entity-container">
      <h2>Covenant Types</h2>
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
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Covenant Type</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {covenantTypes.map(covenantType => (
          <div key={covenantType.id} className="entity-item">
            <div className="entity-info">
              <h3>{covenantType.name}</h3>
              <p>Description: {covenantType.description || 'N/A'}</p>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(covenantType)}>Edit</button>
              <button onClick={() => handleDelete(covenantType.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.CovenantTypes = CovenantTypes;
