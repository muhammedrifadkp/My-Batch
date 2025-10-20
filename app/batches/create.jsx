import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

export default function CreateBatchScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const saveBatch = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Batch name is required');
      return;
    }

    try {
      const newBatch = {
        id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      // Get existing batches
      const storedBatches = await AsyncStorage.getItem('batches');
      const batches = storedBatches ? JSON.parse(storedBatches) : [];
      
      // Add new batch
      batches.push(newBatch);
      
      // Save updated batches
      await AsyncStorage.setItem('batches', JSON.stringify(batches));
      
      // Initialize empty students array for this batch
      await AsyncStorage.setItem(`students_${newBatch.id}`, JSON.stringify([]));
      
      // Initialize empty attendance array for this batch
      await AsyncStorage.setItem(`attendance_${newBatch.id}`, JSON.stringify([]));
      
      Alert.alert('Success', 'Batch created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving batch:', error);
      Alert.alert('Error', 'Failed to create batch');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Batch</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Batch Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter batch name"
          value={name}
          onChangeText={setName}
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter batch description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={saveBatch}
          >
            <Text style={styles.saveButtonText}>Save Batch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#eee',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4285f4',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});