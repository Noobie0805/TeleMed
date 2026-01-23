import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './features/auth/Login';
import SymptomChecker from './features/symptoms/SymptomChecker';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.stringify(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/symptoms" />} />
          <Route path="/symptoms" element={<RequireAuth><SymptomChecker /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;





