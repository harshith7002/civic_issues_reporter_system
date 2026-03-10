import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';


function Register() {
  const [contact, setContact] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Logic: Send OTP or save user
    console.log("Registering with:", contact);
    alert("A verification link has been sent to " + contact);
    // Redirect to login after a brief delay
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="login-page-container">
      <div className="branding-container">
        <div className="trust-badge">
          <ShieldCheck size={18} color="#ffffff" strokeWidth={2.5} />
          <span>Official Civic Portal</span>
        </div>

        <h1>Jan Sahayak</h1>

        <p className="tagline-primary">
          Join the AI-driven accountability movement.
        </p>

        <p className="tagline-secondary">
          Create an account to track issues and contribute to a smarter city.
        </p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          {/* Back button to go back to Login */}
          <Link to="/login" className="back-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#1e40af',
            fontWeight: '600',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <ArrowLeft size={18} /> Back to Sign In
          </Link>

          <div className="form-header">
            <h2>Register</h2>
            <p>Enter your contact details to get started</p>
          </div>

          <form onSubmit={handleRegister} className="professional-form">
            <div className="form-field">
              <label>Mobile Number or Email</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. +91 9876543210 or name@mail.com"
                required />
            </div>

            <button type="submit" className="login-btn">Verify & Register</button>
          </form>

          <div className="feature-highlight">
            <h4>Why Register?</h4>
            <ul style={{ padding: 0 }}>
              <li>• Access personalized tracking dashboard</li>
              <li>• Receive instant updates on reported issues</li>
              <li>• Directly verify official resolutions</li>
            </ul>
          </div>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login" className="footer-link highlight" style={{ marginLeft: '5px' }}>Sign In here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;