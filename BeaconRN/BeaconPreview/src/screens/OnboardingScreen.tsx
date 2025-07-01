import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { User, UserType, ResponderType } from '../types';
import { COLORS, SIZES, EMERGENCY_TYPES } from '../constants';

interface OnboardingScreenProps {
  onAuthenticate: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onAuthenticate }) => {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [responderType, setResponderType] = useState<ResponderType | null>(null);

  const handleComplete = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!userType) {
      Alert.alert('Error', 'Please select user type');
      return;
    }

    if (userType === 'responder' && !responderType) {
      Alert.alert('Error', 'Please select responder type');
      return;
    }

    // Create demo user
    const user: User = {
      id: `user_${Date.now()}`,
      type: 'user',
      userId: `user_${Date.now()}`,
      name: name.trim(),
      userType,
      responderType: responderType || undefined,
      location: {
        latitude: 59.3293, // Stockholm
        longitude: 18.0686,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };

    // For demo purposes, just call onAuthenticate instead of using Redux
    onAuthenticate();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Beacon Emergency</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile to get started
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                userType === 'requester' && styles.selectedOption,
              ]}
              onPress={() => {
                setUserType('requester');
                setResponderType(null);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  userType === 'requester' && styles.selectedOptionText,
                ]}
              >
                🙋‍♂️ Person in Need
              </Text>
              <Text style={styles.optionDescription}>
                Request emergency assistance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                userType === 'responder' && styles.selectedOption,
              ]}
              onPress={() => setUserType('responder')}
            >
              <Text
                style={[
                  styles.optionText,
                  userType === 'responder' && styles.selectedOptionText,
                ]}
              >
                🚑 Emergency Responder
              </Text>
              <Text style={styles.optionDescription}>
                Provide emergency assistance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {userType === 'responder' && (
          <View style={styles.section}>
            <Text style={styles.label}>Responder Type</Text>
            <View style={styles.responderTypes}>
              {EMERGENCY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.responderType,
                    responderType === type && styles.selectedOption,
                  ]}
                  onPress={() => setResponderType(type)}
                >
                  <Text
                    style={[
                      styles.responderTypeText,
                      responderType === type && styles.selectedOptionText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingTop: 60,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  input: {
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    fontSize: SIZES.body2,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  optionContainer: {
    gap: SIZES.base,
  },
  option: {
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedOptionText: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  responderTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  responderType: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  responderTypeText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  continueButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default OnboardingScreen;
