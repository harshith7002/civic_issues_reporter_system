import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for redirection

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation check
    if (username && password) {
      // 1. Create a user object
      const userData = { 
        username: username, 
        role: 'user',
        loginTime: new Date().toISOString() 
      };

      // 2. Save to LocalStorage so the session persists
      localStorage.setItem("js_user", JSON.stringify(userData));

      // 3. Update the App state via the prop
      // This is what makes the "Report" tab appear/work instantly
      onLoginSuccess(userData);

      // 4. Redirect the user to the Report page
      navigate('/report');
    }
  };

  return (
    <div className="login-page-container">
      {/* Branding Section (Left) */}
      <div className="branding-container">
        <div className="trust-badge">
          <ShieldCheck size={18} color="#ffffff" strokeWidth={2.5} />
          <span>Official Civic Portal</span>
        </div>
        
        <h1>Jan Sahayak</h1>
        
        <p className="tagline-primary">
          Empowering citizens through AI-driven accountability.
        </p>
        
        <p className="tagline-secondary">
          Bridging the gap between citizens and governance through technology.
        </p>
      </div>

      {/* Form Section (Right) */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="form-header">
             <h2>Sign In</h2>
             <p>Access your accountability dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="professional-form">
            <div className="form-field">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username"
                required 
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
            </div>
            <button type="submit" className="login-btn">Sign In</button>
          </form>

          <div className="feature-highlight">
            <h4>Platform Features</h4>
            <ul>
              <li>• AI-Powered Issue Categorization</li>
              <li>• Real-time Official Tracking</li>
              <li>• Citizen-led Resolution Verification</li>
            </ul>
          </div>
          
          <div className="login-footer">
            <a href="#forgot" className="footer-link">Forgot Password?</a>
            <p>New user? <Link to="/register" className="footer-link highlight">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
