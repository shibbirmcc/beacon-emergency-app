import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { store } from './src/store/index.js';

// Simple Web Components for Preview
const OnboardingScreen = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Welcome to Beacon</h2>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Emergency response app for connecting those who need help with those who can help.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
        <button style={{
          padding: '16px',
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          I need help
        </button>
        
        <button style={{
          padding: '16px',
          backgroundColor: '#34C759',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          I can help
        </button>
      </div>
    </div>
  );
};

const MapScreen = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Emergency Map</h2>
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#E8F4FD',
        border: '2px solid #007AFF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#007AFF'
      }}>
        🗺️ Interactive Map View
        <br />
        (Shows emergency locations and responders)
      </div>
    </div>
  );
};

const EmergencyScreen = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ color: '#FF3B30', marginBottom: '20px' }}>Emergency Request</h2>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#FFE6E6',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '18px' }}>
            🚨 Emergency in Progress
          </p>
          <p style={{ color: '#666' }}>
            Location: Stockholm, Sweden<br />
            Type: Medical Emergency<br />
            Status: Help on the way
          </p>
        </div>
        
        <button style={{
          padding: '16px 32px',
          backgroundColor: '#FF3B30',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%'
        }}>
          Cancel Emergency Request
        </button>
      </div>
    </div>
  );
};

const ProfileScreen = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>User Profile</h2>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#F5F5F5',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
          <h3 style={{ color: '#333', margin: '10px 0' }}>Demo User</h3>
          <p style={{ color: '#666' }}>Emergency Responder</p>
          <p style={{ color: '#666' }}>Medical Professional</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{
            padding: '12px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Edit Profile
          </button>
          
          <button style={{
            padding: '12px',
            backgroundColor: '#34C759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Set Availability
          </button>
          
          <button style={{
            padding: '12px',
            backgroundColor: '#FF9500',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Emergency Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const WebApp = () => {
  return (
    <Provider store={store}>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '0'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{ 
                color: '#007AFF', 
                margin: '0 0 10px 0',
                fontSize: '28px',
                fontWeight: 'bold'
              }}>
                🚨 Beacon Emergency App
              </h1>
              <p style={{ color: '#666', margin: '0', fontSize: '16px' }}>
                React Native to Web Preview - Emergency Response System
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <div style={{
            backgroundColor: 'white',
            padding: '15px 20px',
            borderBottom: '1px solid #E0E0E0'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link to="/onboarding" style={{ 
                  color: '#007AFF', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F0F7FF',
                  fontWeight: '500'
                }}>
                  📱 Onboarding
                </Link>
                <Link to="/map" style={{ 
                  color: '#007AFF', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F0F7FF',
                  fontWeight: '500'
                }}>
                  🗺️ Map View
                </Link>
                <Link to="/emergency" style={{ 
                  color: '#007AFF', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F0F7FF',
                  fontWeight: '500'
                }}>
                  🚨 Emergency
                </Link>
                <Link to="/profile" style={{ 
                  color: '#007AFF', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F0F7FF',
                  fontWeight: '500'
                }}>
                  👤 Profile
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Content */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              minHeight: '500px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Routes>
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/emergency" element={<EmergencyScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/" element={<OnboardingScreen />} />
              </Routes>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{
            backgroundColor: '#333',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <p style={{ margin: '0' }}>
              Beacon Emergency App - React Native Migration Preview
            </p>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WebApp />);
