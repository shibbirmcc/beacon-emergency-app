import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { COLORS, SIZES, EMERGENCY_TYPES } from '../../constants';

interface EmergencyRequestDialogProps {
  visible: boolean;
  onRequestType: (type: string, priority: string, notes?: string) => void;
  onCancel: () => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const EmergencyRequestDialog: React.FC<EmergencyRequestDialogProps> = ({
  visible,
  onRequestType,
  onCancel,
  userLocation,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');

  const priorities = [
    { value: 'low', label: 'Low', color: COLORS.success },
    { value: 'medium', label: 'Medium', color: COLORS.warning },
    { value: 'high', label: 'High', color: COLORS.error },
    { value: 'critical', label: 'Critical', color: COLORS.dark },
  ];

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an emergency type');
      return;
    }

    if (!userLocation) {
      Alert.alert('Error', 'Location is required to send emergency request');
      return;
    }

    onRequestType(selectedType, selectedPriority, notes.trim() || undefined);
    
    // Reset form
    setSelectedType('');
    setSelectedPriority('medium');
    setNotes('');
  };

  const handleCancel = () => {
    // Reset form
    setSelectedType('');
    setSelectedPriority('medium');
    setNotes('');
    onCancel();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onSwipeComplete={handleCancel}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Request</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Emergency Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Type</Text>
            <View style={styles.typeGrid}>
              {EMERGENCY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityButton,
                    { borderColor: priority.color },
                    selectedPriority === priority.value && {
                      backgroundColor: priority.color,
                    },
                  ]}
                  onPress={() => setSelectedPriority(priority.value)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      { color: priority.color },
                      selectedPriority === priority.value && {
                        color: COLORS.background,
                      },
                    ]}
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe the emergency situation..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{notes.length}/500</Text>
          </View>

          {/* Location Info */}
          {userLocation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Location</Text>
              <Text style={styles.locationText}>
                Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Send Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  typeButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.disabled,
    backgroundColor: COLORS.surface,
    minWidth: '45%',
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  typeButtonTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.disabled,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: SIZES.body,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: 100,
  },
  characterCount: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  locationText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.disabled,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default EmergencyRequestDialog;
