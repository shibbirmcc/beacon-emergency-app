import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Retry',
  type = 'error',
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: '⚠️',
        };
      case 'info':
        return {
          backgroundColor: COLORS.info,
          icon: 'ℹ️',
        };
      default: // error
        return {
          backgroundColor: COLORS.error,
          icon: '❌',
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <View style={[styles.container, { backgroundColor: typeConfig.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{typeConfig.icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    margin: SIZES.margin,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  icon: {
    fontSize: 20,
    marginRight: SIZES.base,
  },
  message: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.background,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default ErrorMessage;
