import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import BabySetup from './components/BabySetup';
import Dashboard from './components/Dashboard';
import { api } from './api';

type AuthView = 'login' | 'register';

function App() {
  const [user, setUser] = useState<any>(null);
  const [baby, setBaby] = useState<any>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('bt_user');
    const savedBaby = localStorage.getItem('bt_baby');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (savedBaby) {
        const parsedBaby = JSON.parse(savedBaby);
        // Only restore baby if it belongs to the logged-in user
        if (parsedBaby.ownerId === parsed.id) {
          setBaby(parsedBaby);
        }
      }
    }
    setChecking(false);
  }, []);

  const handleLogin = async (u: any) => {
    setUser(u);
    localStorage.setItem('bt_user', JSON.stringify(u));
    setAuthView('login');
    // Fetch full user details to check for existing babies
    try {
      const fullUser = await api.getUser(u.id);
      if (fullUser.babies && fullUser.babies.length > 0) {
        const firstBaby = fullUser.babies[0];
        setBaby(firstBaby);
        localStorage.setItem('bt_baby', JSON.stringify(firstBaby));
      }
    } catch {
      // ignore fetch error, let user create baby manually
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bt_user');
    localStorage.removeItem('bt_baby');
    setUser(null);
    setBaby(null);
    setAuthView('login');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <Register onRegistered={handleLogin} onBack={() => setAuthView('login')} />;
    }
    return <Login onLogin={handleLogin} onRegister={() => setAuthView('register')} />;
  }

  if (!baby) return <BabySetup userId={user.id} onSetup={(b) => { setBaby(b); localStorage.setItem('bt_baby', JSON.stringify(b)); }} />;

  return <Dashboard user={user} baby={baby} onLogout={handleLogout} />;
}

export default App;
