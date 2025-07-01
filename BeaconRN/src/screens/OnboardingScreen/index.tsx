import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../../store/slices/userSlice';
import { setLocationPermission } from '../../store/slices/locationSlice';

// Services
import { LocationService } from '../../services/LocationService';
import { DatabaseService } from '../../services/DatabaseService';
import { notificationService } from '../../services/NotificationService';

// Components
import { Loading, ErrorMessage } from '../../components';

// Types and Constants
import { User, UserType, ResponderType } from '../../types';
import { COLORS, SIZES, EMERGENCY_TYPES } from '../../constants';

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [responderType, setResponderType] = useState<ResponderType | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleNext = () => {
    if (currentStep === 1 && userType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && userType === 'responder' && responderType) {
      setCurrentStep(3);
    } else if (currentStep === 2 && userType === 'requester') {
      setCurrentStep(3);
    } else if (currentStep === 3 && name.trim()) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!userType || !name.trim()) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    if (userType === 'responder' && !responderType) {
      Alert.alert('Error', 'Please select your responder type');
      return;
    }

    try {
      setIsLoading(true);
      setErrorState(null);

      // Request permissions
      const locationPermission = await LocationService.requestLocationPermission();
      if (!locationPermission) {
        throw new Error('Location permission is required to use the app');
      }
      dispatch(setLocationPermission(true));

      const notificationPermission = await notificationService.requestNotificationPermission();
      console.log('Notification permission:', notificationPermission);

      // Get current location
      const currentLocationResult = await LocationService.getCurrentLocation();
      if (!currentLocationResult.success) {
        throw new Error('Could not get current location');
      }

      // Create user profile
      const user: User = {
        id: generateUserId(),
        type: 'user',
        userId: generateUserId(),
        name: name.trim(),
        userType,
        responderType: userType === 'responder' ? responderType : undefined,
        location: currentLocationResult.data!,
        status: userType === 'responder' ? 'available' : undefined,
        lastUpdated: new Date().toISOString(),
      };

      // Save user to database
      await DatabaseService.saveUser(user);

      // Update Redux state
      dispatch(setUser(user));

      Alert.alert(
        'Welcome to Beacon!',
        'Your profile has been created successfully. You can now start using the emergency response system.',
        [{ text: 'Get Started', style: 'default' }]
      );

    } catch (error) {
      console.error('Onboarding failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete setup';
      setErrorState(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return userType !== null;
      case 2:
        return userType === 'requester' || (userType === 'responder' && responderType !== null);
      case 3:
        return name.trim().length > 0;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is your role?</Text>
      <Text style={styles.stepDescription}>
        Select your role to personalize your Beacon experience
      </Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            userType === 'requester' && styles.roleOptionSelected,
          ]}
          onPress={() => setUserType('requester')}
        >
          <Text style={styles.roleIcon}>🆘</Text>
          <Text style={styles.roleTitle}>Emergency Requester</Text>
          <Text style={styles.roleDescription}>
            I need help during emergencies and disasters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleOption,
            userType === 'responder' && styles.roleOptionSelected,
          ]}
          onPress={() => setUserType('responder')}
        >
          <Text style={styles.roleIcon}>🚑</Text>
          <Text style={styles.roleTitle}>Emergency Responder</Text>
          <Text style={styles.roleDescription}>
            I help others during emergencies and disasters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => {
    if (userType === 'requester') {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>You're almost ready!</Text>
          <Text style={styles.stepDescription}>
            As an emergency requester, you'll be able to send help requests to nearby responders during emergencies.
          </Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What you can do:</Text>
            <Text style={styles.infoItem}>• Send emergency requests</Text>
            <Text style={styles.infoItem}>• View nearby responders</Text>
            <Text style={styles.infoItem}>• Track request status</Text>
            <Text style={styles.infoItem}>• Work offline when needed</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>What type of responder are you?</Text>
        <Text style={styles.stepDescription}>
          Select your expertise to help match you with appropriate emergency requests
        </Text>
        
        <View style={styles.responderGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.responderOption,
                responderType === type && styles.responderOptionSelected,
              ]}
              onPress={() => setResponderType(type)}
            >
              <Text style={styles.responderIcon}>
                {type === 'Ambulance' && '🚑'}
                {type === 'Doctor' && '👨‍⚕️'}
                {type === 'Fire Truck' && '🚒'}
                {type === 'Rescue Team' && '👨‍🚒'}
                {type === 'Generator' && '⚡'}
                {type === 'Water Supply' && '💧'}
              </Text>
              <Text style={styles.responderText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <Text style={styles.stepDescription}>
        This name will be visible to other users when responding to emergencies
      </Text>
      
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        autoFocus={true}
        maxLength={50}
      />
      
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>Required Permissions:</Text>
        <Text style={styles.permissionItem}>📍 Location - To find nearby help and responders</Text>
        <Text style={styles.permissionItem}>🔔 Notifications - To receive emergency alerts</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="Setting up your profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.appTitle}>Beacon Emergency</Text>
        <Text style={styles.stepIndicator}>Step {currentStep} of 3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setErrorState(null)}
            retryText="Dismiss"
          />
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.actions}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 1.5,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SIZES.base / 2,
  },
  stepIndicator: {
    fontSize: SIZES.body,
    color: COLORS.background,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  stepContainer: {
    paddingVertical: SIZES.padding * 2,
  },
  stepTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  stepDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.padding * 2,
  },
  optionsContainer: {
    gap: SIZES.padding,
  },
  roleOption: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    borderWidth: 2,
    borderColor: COLORS.light,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: SIZES.base,
  },
  roleTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  roleDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  responderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
    justifyContent: 'space-between',
  },
  responderOption: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.light,
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  responderOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  responderIcon: {
    fontSize: 32,
    marginBottom: SIZES.base / 2,
  },
  responderText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.disabled,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.padding * 2,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  infoItem: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  permissionInfo: {
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  permissionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  permissionItem: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  actions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: SIZES.base,
  },
  backButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.disabled,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  nextButtonText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
