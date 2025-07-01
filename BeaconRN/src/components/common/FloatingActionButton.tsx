import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  title?: string;
  disabled?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '🚨',
  title,
  disabled = false,
  position = 'bottom-right',
  size = 'large',
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 56,
          fontSize: 16,
          iconSize: 20,
        };
      case 'medium':
        return {
          buttonSize: 64,
          fontSize: 18,
          iconSize: 24,
        };
      default: // large
        return {
          buttonSize: 72,
          fontSize: 20,
          iconSize: 28,
        };
    }
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: SIZES.padding * 2,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyle, left: SIZES.padding };
      case 'bottom-center':
        return { 
          ...baseStyle, 
          left: '50%',
          marginLeft: -getSizeConfig().buttonSize / 2,
        };
      default: // bottom-right
        return { ...baseStyle, right: SIZES.padding };
    }
  };

  const sizeConfig = getSizeConfig();
  const positionStyle = getPositionStyle();

  return (
    <View style={[styles.container, positionStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: sizeConfig.buttonSize,
            height: sizeConfig.buttonSize,
            borderRadius: sizeConfig.buttonSize / 2,
          },
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>
          {icon}
        </Text>
        {title && (
          <Text style={[styles.title, { fontSize: sizeConfig.fontSize / 1.5 }]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  button: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0.1,
  },
  icon: {
    color: COLORS.background,
  },
  title: {
    color: COLORS.background,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default FloatingActionButton;
