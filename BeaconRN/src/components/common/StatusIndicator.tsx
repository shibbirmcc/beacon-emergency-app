import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, STATUS_COLORS } from '../../constants';

interface StatusIndicatorProps {
  status: 'available' | 'occupied' | 'unavailable';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  showText = true,
  style,
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          dotSize: 8,
          fontSize: SIZES.caption,
          padding: SIZES.base / 2,
        };
      case 'large':
        return {
          dotSize: 16,
          fontSize: SIZES.body,
          padding: SIZES.base,
        };
      default: // medium
        return {
          dotSize: 12,
          fontSize: SIZES.body,
          padding: SIZES.base * 0.75,
        };
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Busy';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const sizeConfig = getSizeConfig();
  const statusColor = STATUS_COLORS[status] || COLORS.disabled;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: statusColor,
          },
        ]}
      />
      {showText && (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: statusColor,
              marginLeft: sizeConfig.padding / 2,
            },
          ]}
        >
          {getStatusText(status)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontWeight: '500',
  },
});

export default StatusIndicator;
