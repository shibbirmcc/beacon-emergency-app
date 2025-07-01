import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'responder' | 'requester' | null>(null);
  const [responderType, setResponderType] = useState<string | null>(null);
  const [name, setName] = useState('');

  const handleComplete = () => {
    const user = {
      userId: `user_${Date.now()}`,
      name: name || 'Demo User',
      userType: userType || 'requester',
      responderType: responderType || undefined,
      location: { lat: 59.3293, lon: 18.0686 }, // Stockholm
    };
    dispatch(setUser(user));
  };

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: currentStep >= step ? '#007AFF' : '#E0E0E0',
            margin: '0 8px',
          }}
        />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Welcome to Beacon</h2>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Choose your role in emergency situations
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          style={{
            padding: '16px',
            backgroundColor: userType === 'requester' ? '#007AFF' : '#F0F0F0',
            color: userType === 'requester' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onClick={() => setUserType('requester')}
        >
          <div style={{ fontWeight: 'bold' }}>I need help</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Request emergency assistance</div>
        </button>
        
        <button
          style={{
            padding: '16px',
            backgroundColor: userType === 'responder' ? '#007AFF' : '#F0F0F0',
            color: userType === 'responder' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onClick={() => setUserType('responder')}
        >
          <div style={{ fontWeight: 'bold' }}>I can help</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Respond to emergency requests</div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (userType === 'requester') {
      return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Personal Information</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '20px',
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Responder Type</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          What type of emergency responder are you?
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Medical Professional', 'Firefighter', 'Police Officer', 'Search & Rescue', 'Other'].map((type) => (
            <button
              key={type}
              style={{
                padding: '16px',
                backgroundColor: responderType === type ? '#007AFF' : '#F0F0F0',
                color: responderType === type ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setResponderType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Personal Information</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: '100%',
          padding: '16px',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          fontSize: '16px',
          marginBottom: '20px',
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      {renderStepIndicator()}
      
      <div style={{ minHeight: '300px' }}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        {currentStep > 1 && (
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#F0F0F0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </button>
        )}
        
        <button
          style={{
            padding: '12px 24px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
          onClick={() => {
            if (currentStep === 3 || (currentStep === 2 && userType === 'requester')) {
              handleComplete();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={
            (currentStep === 1 && !userType) ||
            (currentStep === 2 && userType === 'responder' && !responderType)
          }
        >
          {currentStep === 3 || (currentStep === 2 && userType === 'requester') ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
