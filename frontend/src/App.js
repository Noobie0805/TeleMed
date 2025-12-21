import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Consult from './pages/Consult';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Assistant from './pages/Assistant';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consult" element={<Consult />} />
            <Route path="/about" element={<About />} />
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/signup" element={<Signup />} /> */}
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
