import React, { useState } from 'react';
import { RiShieldUserLine } from 'react-icons/ri';
import './Login.css';

const AdminLogin = ({ onAdminLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Credentials for municipal staff
    if (username.trim() === 'admin' && password.trim() === 'admin123') {
      const adminData = { role: 'admin', user: username };
      
      // Save session
      localStorage.setItem("js_admin", JSON.stringify(adminData));
      
      // Trigger the state update in AppRoutes
      onAdminLogin(adminData);
    } else {
      alert("Invalid Admin Credentials. Please use: admin / admin123");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card" style={{ 
        margin: 'auto', 
        background: '#ffffff', // Pure white background
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(30, 64, 175, 0.1)', 
        border: '1px solid #e2e8f0',
        padding: '50px'
      }}>
        <div className="form-header" style={{ textAlign: 'center', marginBottom: '35px' }}>
          {/* Circular icon badge for a professional look */}
          <div style={{ 
            background: '#eff6ff', 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 15px',
            border: '2px solid #dbeafe'
          }}>
            <RiShieldUserLine size={35} color="#1e40af" />
          </div>
          
          <h2 style={{ color: '#1e3a8a', fontSize: '2.4rem', fontWeight: '800', margin: '0' }}>
            Staff Login
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: '500' }}>
            Access the Municipal Control Center
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="professional-form">
          <div className="form-field">
            <label style={{ color: '#1e293b', fontWeight: '700' }}>Admin Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter Admin ID"
              style={{ 
                background: '#ffffff', 
                border: '2px solid #e2e8f0',
                color: '#0f172a' 
              }}
              required 
            />
          </div>
          
          <div className="form-field">
            <label style={{ color: '#1e293b', fontWeight: '700' }}>Access Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ 
                background: '#ffffff', 
                border: '2px solid #e2e8f0',
                color: '#0f172a' 
              }}
              required 
            />
          </div>
          
          <button type="submit" className="login-btn" style={{ 
            background: '#1e40af', 
            fontSize: '1.1rem', 
            height: '55px',
            marginTop: '15px' 
          }}>
            Login to Dashboard
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Authorized Personnel Only
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
