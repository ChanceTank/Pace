const { useState, useEffect } = React;

const Dashboard = window.Dashboard;
const People = window.People;
const Circles = window.Circles;
const Checkins = window.Checkins;
const Groups = window.Groups;
const ActionItems = window.ActionItems;
const CovenantTypes = window.CovenantTypes;
const Tags = window.Tags;

const API_URL = "http://localhost:3000/api";

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const renderView = () => {
    switch (currentView) {
      case 'people':
        return <People apiUrl={API_URL} />;
      case 'circles':
        return <Circles apiUrl={API_URL} />;
      case 'checkins':
        return <Checkins apiUrl={API_URL} />;
      case 'groups':
        return <Groups apiUrl={API_URL} />;
      case 'actionItems':
        return <ActionItems apiUrl={API_URL} />;
      case 'covenantTypes':
        return <CovenantTypes apiUrl={API_URL} />;
      case 'tags':
        return <Tags apiUrl={API_URL} />;
      default:
        return <Dashboard apiUrl={API_URL} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔄 Pace - Social Frequency Tracker</h1>

        {currentView !== 'dashboard' && (
          <button onClick={() => setCurrentView('dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        )}
      </header>
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
