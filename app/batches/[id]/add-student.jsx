import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

export default function AddStudentScreen() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const router = useRouter();
  const { id: batchId } = useLocalSearchParams();

  const saveStudent = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Student name is required');
      return;
    }

    if (!studentId.trim()) {
      Alert.alert('Validation Error', 'Student ID is required');
      return;
    }

    try {
      // Get existing students for this batch
      const storedStudents = await AsyncStorage.getItem(`students_${batchId}`);
      const students = storedStudents ? JSON.parse(storedStudents) : [];
      
      // Check if student ID already exists
      const existingStudent = students.find(student => student.id === studentId.trim());
      if (existingStudent) {
        Alert.alert('Validation Error', 'A student with this ID already exists in this batch');
        return;
      }
      
      // Create new student
      const newStudent = {
        id: studentId.trim(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      
      // Add new student
      students.push(newStudent);
      
      // Save updated students
      await AsyncStorage.setItem(`students_${batchId}`, JSON.stringify(students));
      
      Alert.alert('Success', 'Student added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving student:', error);
      Alert.alert('Error', 'Failed to add student');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Student</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Student Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student name"
          value={name}
          onChangeText={setName}
        />
        
        <Text style={styles.label}>Student ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student ID"
          value={studentId}
          onChangeText={setStudentId}
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
            onPress={saveStudent}
          >
            <Text style={styles.saveButtonText}>Add Student</Text>
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