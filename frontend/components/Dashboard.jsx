const { useState, useEffect } = React;
const apiCall = window.apiCall;

function Dashboard({ apiUrl, onNavigate }) {
  const [stats, setStats] = useState({
    people: 0,
    circles: 0,
    checkins: 0,
    groups: 0,
    actionItems: 0,
    covenantTypes: 0,
    tags: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [people, circles, checkins, groups, actionItems, covenantTypes, tags] = await Promise.all([
        apiCall('/people'),
        apiCall('/circles'),
        apiCall('/checkins'),
        apiCall('/groups'),
        apiCall('/action_items'),
        apiCall('/covenant_types'),
        apiCall('/tags')
      ]);

      setStats({
        people: people.length,
        circles: circles.length,
        checkins: checkins.length,
        groups: groups.length,
        actionItems: actionItems.length,
        covenantTypes: covenantTypes.length,
        tags: tags.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('people')}>
          <div className="stat-number">{stats.people}</div>
          <div className="stat-label">People</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('circles')}>
          <div className="stat-number">{stats.circles}</div>
          <div className="stat-label">Circles</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('checkins')}>
          <div className="stat-number">{stats.checkins}</div>
          <div className="stat-label">Checkins</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('groups')}>
          <div className="stat-number">{stats.groups}</div>
          <div className="stat-label">Groups</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('actionItems')}>
          <div className="stat-number">{stats.actionItems}</div>
          <div className="stat-label">Action Items</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('covenantTypes')}>
          <div className="stat-number">{stats.covenantTypes}</div>
          <div className="stat-label">Covenant Types</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('tags')}>
          <div className="stat-number">{stats.tags}</div>
          <div className="stat-label">Tags</div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
