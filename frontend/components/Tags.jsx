const { useState, useEffect } = React;
const apiCall = window.apiCall;

function Tags({ apiUrl }) {
  const [tags, setTags] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    tag: ''
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await apiCall('/tags');
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiCall(`/tags/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setEditing(null);
      } else {
        await apiCall('/tags', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setFormData({
        tag: ''
      });
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditing(tag.id);
    setFormData({
      tag: tag.tag
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await apiCall(`/tags/${id}`, { method: 'DELETE' });
        loadTags();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      tag: ''
    });
  };

  return (
    <div className="entity-container">
      <h2>Tags</h2>
      <form onSubmit={handleSubmit} className="entity-form">
        <input
          type="text"
          placeholder="Tag"
          value={formData.tag}
          onChange={(e) => setFormData({...formData, tag: e.target.value})}
          required
        />
        <div className="form-buttons">
          <button type="submit">{editing ? 'Update' : 'Add'} Tag</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="entity-list">
        {tags.map(tag => (
          <div key={tag.id} className="entity-item">
            <div className="entity-info">
              <h3>{tag.tag}</h3>
            </div>
            <div className="entity-actions">
              <button onClick={() => handleEdit(tag)}>Edit</button>
              <button onClick={() => handleDelete(tag.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Tags = Tags;
