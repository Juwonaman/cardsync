import {useAuth} from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {user?.name}</h1>
      <p>Your financial dashboard is coming soon.</p>
      <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;