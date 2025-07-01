import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import { COLORS, SIZES } from '../constants';

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
      status: 'available' as const,
      lastUpdated: new Date().toISOString(),
    };
    
    dispatch(setUser(user));
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who are you?</Text>
      <Text style={styles.stepSubtitle}>Select your role in emergency response</Text>
      
      <TouchableOpacity
        style={[styles.optionButton, userType === 'requester' && styles.selectedOption]}
        onPress={() => setUserType('requester')}
      >
        <Text style={styles.optionIcon}>🙋‍♂️</Text>
        <Text style={styles.optionTitle}>Requester</Text>
        <Text style={styles.optionDesc}>I might need emergency assistance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, userType === 'responder' && styles.selectedOption]}
        onPress={() => setUserType('responder')}
      >
        <Text style={styles.optionIcon}>🚑</Text>
        <Text style={styles.optionTitle}>Responder</Text>
        <Text style={styles.optionDesc}>I provide emergency assistance</Text>
      </TouchableOpacity>

      {userType && (
        <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(2)}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      {userType === 'responder' ? (
        <>
          <Text style={styles.stepTitle}>What type of responder are you?</Text>
          {['Ambulance', 'Doctor', 'Fire Truck', 'Rescue Team', 'Generator', 'Water Supply'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.responderOption, responderType === type && styles.selectedOption]}
              onPress={() => setResponderType(type)}
            >
              <Text style={styles.responderText}>{type}</Text>
            </TouchableOpacity>
          ))}
          {responderType && (
            <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(3)}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={styles.stepTitle}>You're all set!</Text>
          <Text style={styles.stepSubtitle}>Ready to use emergency services</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(3)}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <TextInput
        style={styles.nameInput}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      
      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>Complete Setup</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Beacon Emergency</Text>
          <Text style={styles.subtitle}>Setup your profile</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, currentStep >= 1 && styles.activeDot]} />
            <View style={[styles.progressDot, currentStep >= 2 && styles.activeDot]} />
            <View style={[styles.progressDot, currentStep >= 3 && styles.activeDot]} />
          </View>
        </View>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.h4,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  responderOption: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  responderText: {
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  nameInput: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    fontSize: SIZES.body1,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h5,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h5,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
