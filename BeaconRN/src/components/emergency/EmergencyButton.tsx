import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface EmergencyButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  title?: string;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onPress,
  disabled = false,
  size = 'large',
  title = 'EMERGENCY',
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 80,
          fontSize: SIZES.body,
          iconSize: 20,
        };
      case 'medium':
        return {
          buttonSize: 120,
          fontSize: SIZES.h4,
          iconSize: 28,
        };
      default: // large
        return {
          buttonSize: 160,
          fontSize: SIZES.h3,
          iconSize: 36,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  const animatePress = () => {
    if (disabled) return;

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            width: sizeConfig.buttonSize,
            height: sizeConfig.buttonSize,
            borderRadius: sizeConfig.buttonSize / 2,
            transform: [{ scale: scaleValue }],
          },
          disabled && styles.disabledButton,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: sizeConfig.buttonSize,
              height: sizeConfig.buttonSize,
              borderRadius: sizeConfig.buttonSize / 2,
            },
          ]}
          onPress={animatePress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>
            🚨
          </Text>
          <Text style={[styles.title, { fontSize: sizeConfig.fontSize }]}>
            {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {size === 'large' && (
        <Text style={styles.subtitle}>
          Tap to send emergency request
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0.1,
  },
  icon: {
    marginBottom: 4,
  },
  title: {
    color: COLORS.background,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: SIZES.base,
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EmergencyButton;
