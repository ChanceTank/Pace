const { useState, useEffect } = React;
const apiCall = window.apiCall;

function Checkins({ apiUrl }) {
  const [checkins, setCheckins] = useState([]);
  const [people, setPeople] = useState([]);
  const [covenantTypes, setCovenantTypes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    person_id: '',
    duration: '',
    type_id: '',
    notes: '',
    summary_feeling: '',
    topics_discussed: '',
    next_followup_date: ''
  });

  useEffect(() => {
    loadCheckins();
    loadPeople();
    loadCovenantTypes();
  }, []);

  const loadCheckins = async () => {
    try {
      const data = await apiCall('/checkins');
      setCheckins(data);
    } catch (error) {
      console.error('Error loading checkins:', error);
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
        await apiCall(`/checkins/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/checkins', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        person_id: '',
        duration: '',
        type_id: '',
        notes: '',
        summary_feeling: '',
        topics_discussed: '',
        next_followup_date: ''
      });
      loadCheckins();
    } catch (error) {
      console.error('Error saving checkin:', error);
    }
  };

  const handleEdit = (checkin) => {
    setEditing(checkin.id);
    setFormData({
      person_id: checkin.person_id,
      duration: checkin.duration || '',
      type_id: checkin.type_id || '',
      notes: checkin.notes || '',
      summary_feeling: checkin.summary_feeling || '',
      topics_discussed: checkin.topics_discussed || '',
      next_followup_date: checkin.next_followup_date || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this checkin?')) {
      try {
        await apiCall(`/checkins/${id}`, { method: 'DELETE' });
        loadCheckins();
      } catch (error) {
        console.error('Error deleting checkin:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      person_id: '',
      duration: '',
      type_id: '',
      notes: '',
      summary_feeling: '',
      topics_discussed: '',
      next_followup_date: ''
    });
  };

  const getPersonName = (personId) => {
    const person = people.find(p => p.id === personId);
    return person ? person.name : 'Unknown';
  };

  const getCovenantTypeName = (typeId) => {
    const type = covenantTypes.find(t => t.id === typeId);
    return type ? type.name : 'N/A';
  };

  return (
    <div className="entity-container">
      <h2>Checkins</h2>
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
        <input
          type="text"
          placeholder="Duration (e.g., 30 minutes)"
          value={formData.duration}
          onChange={(e) => setFormData({...formData, duration: e.target.value})}
        />
        <select
          value={formData.type_id}
          onChange={(e) => setFormData({...formData, type_id: e.target.value})}
        >
          <option value="">Select Covenant Type</option>
          {covenantTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows="3"
        />
        <input
          type="text"
          placeholder="Summary Feeling"
          value={formData.summary_feeling}
          onChange={(e) => setFormData({...formData, summary_feeling: e.target.value})}
        />
        <textarea
          placeholder="Topics Discussed"
          value={formData.topics_discussed}
          onChange={(e) => setFormData({...formData, topics_discussed: e.target.value})}
          rows="2"
        />
        <input
          type="date"
          placeholder="Next Followup Date"
          value={formData.next_followup_date}
          onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
        />
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Checkin</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {checkins.map(checkin => (
          <div key={checkin.id} className="entity-item">
            <div className="entity-info">
              <h3>{getPersonName(checkin.person_id)}</h3>
              <p>Duration: {checkin.duration || 'N/A'}</p>
              <p>Type: {getCovenantTypeName(checkin.type_id)}</p>
              <p>Feeling: {checkin.summary_feeling || 'N/A'}</p>
              <p>Next Followup: {checkin.next_followup_date || 'N/A'}</p>
              {checkin.notes && <p>Notes: {checkin.notes}</p>}
              {checkin.topics_discussed && <p>Topics: {checkin.topics_discussed}</p>}
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(checkin)}>Edit</button>
              <button onClick={() => handleDelete(checkin.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Checkins = Checkins;
