const { useState, useEffect } = React;
const apiCall = window.apiCall;

function People({ apiUrl }) {
  const [people, setPeople] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    anniversary: '',
    preferred_communication: '',
    profile_picture: ''
  });

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const data = await apiCall('/people');
      setPeople(data);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/people/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/people', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        name: '',
        birthday: '',
        anniversary: '',
        preferred_communication: '',
        profile_picture: ''
      });
      loadPeople();
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const handleEdit = (person) => {
    setEditing(person.id);
    setFormData({
      name: person.name,
      birthday: person.birthday || '',
      anniversary: person.anniversary || '',
      preferred_communication: person.preferred_communication || '',
      profile_picture: person.profile_picture || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await apiCall(`/people/${id}`, { method: 'DELETE' });
        loadPeople();
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: '',
      birthday: '',
      anniversary: '',
      preferred_communication: '',
      profile_picture: ''
    });
  };

  return (
    <div className="entity-container">
      <h2>People</h2>
      <form onSubmit={handleSubmit} className="entity-form">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="Birthday"
          value={formData.birthday}
          onChange={(e) => setFormData({...formData, birthday: e.target.value})}
        />
        <input
          type="date"
          placeholder="Anniversary"
          value={formData.anniversary}
          onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
        />
        <select
          value={formData.preferred_communication}
          onChange={(e) => setFormData({...formData, preferred_communication: e.target.value})}
        >
          <option value="">Preferred Communication</option>
          <option value="Text">Text</option>
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="In-person">In-person</option>
        </select>
        <input
          type="text"
          placeholder="Profile Picture URL"
          value={formData.profile_picture}
          onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
        />
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Person</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {people.map(person => (
          <div key={person.id} className="entity-item">
            <div className="entity-info">
              <h3>{person.name}</h3>
              <p>Birthday: {person.birthday || 'N/A'}</p>
              <p>Anniversary: {person.anniversary || 'N/A'}</p>
              <p>Communication: {person.preferred_communication || 'N/A'}</p>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(person)}>Edit</button>
              <button onClick={() => handleDelete(person.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.People = People;
