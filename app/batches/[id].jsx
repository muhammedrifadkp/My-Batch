import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BatchDetailScreen() {
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    loadBatchData();
  }, [id]);

  const loadBatchData = async () => {
    try {
      // Load batch details
      const storedBatches = await AsyncStorage.getItem('batches');
      if (storedBatches) {
        const batches = JSON.parse(storedBatches);
        const foundBatch = batches.find(b => b.id === id);
        setBatch(foundBatch);
      }
      
      // Load students for this batch
      const storedStudents = await AsyncStorage.getItem(`students_${id}`);
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      const updatedStudents = students.filter(student => student.id !== studentId);
      setStudents(updatedStudents);
      await AsyncStorage.setItem(`students_${id}`, JSON.stringify(updatedStudents));
    } catch (error) {
      console.error('Error deleting student:', error);
      Alert.alert('Error', 'Failed to delete student');
    }
  };

  const confirmDeleteStudent = (studentId, studentName) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove "${studentName}" from this batch?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteStudent(studentId) }
      ]
    );
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>ID: {item.id}</Text>
      </View>
      <View style={styles.studentActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/batches/${id}/edit-student/${item.id}`)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDeleteStudent(item.id, item.name)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!batch) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.batchName}>{batch.name}</Text>
        <Text style={styles.batchDescription}>{batch.description || 'No description'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push(`/batches/${id}/add-student`)}
      >
        <Text style={styles.addButtonText}>Add Student</Text>
      </TouchableOpacity>
      
      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students in this batch</Text>
          <Text style={styles.emptySubtext}>Tap "Add Student" to get started</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudent}
          keyExtractor={(item) => item.id}
          style={styles.studentsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  batchDescription: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4285f4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentsList: {
    flex: 1,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  studentActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#ea4335',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});