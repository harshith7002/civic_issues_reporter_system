import React, { useState } from 'react';
import { ShieldCheck, Globe } from 'lucide-react'; // Added Globe icon
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const translations = {
  en: {
    title: "Sign In",
    subtitle: "Access your accountability dashboard",
    userLabel: "Username",
    passLabel: "Password",
    btn: "Sign In",
    footer: "New user?",
    register: "Register here"
  },
  hi: {
    title: "साइन इन करें",
    subtitle: "अपने जवाबदेही डैशबोर्ड तक पहुंचें",
    userLabel: "उपयोगकर्ता नाम",
    passLabel: "पासवर्ड",
    btn: "साइन इन करें",
    footer: "नए उपयोगकर्ता?",
    register: "यहाँ रजिस्टर करें"
  }
};

const Login = ({ onLoginSuccess }) => {
  const [lang, setLang] = useState('en'); // Default language
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const t = translations[lang]; // Shortcut to current translations

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      const userData = { username, role: 'user' };
      localStorage.setItem("js_user", JSON.stringify(userData));
      onLoginSuccess(userData);
      navigate('/report');
    }
  };

  return (
    <div className="login-page-container">
      <div className="branding-container">
        <div className="trust-badge">
          <ShieldCheck size={18} color="#ffffff" strokeWidth={2.5} />
          <span>Official Civic Portal</span>
        </div>
        <h1>Jan Sahayak</h1>
        <p className="tagline-primary">Empowering citizens through AI-driven accountability.</p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          {/* Language Selector Toggle */}
          <div className="lang-selector">
            <Globe size={16} />
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          <div className="form-header">
             <h2>{t.title}</h2>
             <p>{t.subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="professional-form">
            <div className="form-field">
              <label>{t.userLabel}</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username"
                required 
              />
            </div>
            <div className="form-field">
              <label>{t.passLabel}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="login-btn">{t.btn}</button>
          </form>
          
          <div className="login-footer">
            <p>{t.footer} <Link to="/register" className="footer-link highlight">{t.register}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
