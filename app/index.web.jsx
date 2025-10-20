import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [batches, setBatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const storedBatches = await AsyncStorage.getItem('batches');
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      }
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const deleteBatch = async (batchId) => {
    try {
      const updatedBatches = batches.filter(batch => batch.id !== batchId);
      setBatches(updatedBatches);
      await AsyncStorage.setItem('batches', JSON.stringify(updatedBatches));
      
      // Also delete associated students and attendance records
      await AsyncStorage.removeItem(`students_${batchId}`);
      await AsyncStorage.removeItem(`attendance_${batchId}`);
    } catch (error) {
      console.error('Error deleting batch:', error);
      Alert.alert('Error', 'Failed to delete batch');
    }
  };

  const confirmDelete = (batchId, batchName) => {
    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${batchName}"? This will remove all students and attendance records for this batch.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBatch(batchId) }
      ]
    );
  };

  const renderBatch = ({ item }) => (
    <View style={styles.batchCard}>
      <TouchableOpacity 
        style={styles.batchContent} 
        onPress={() => router.push(`/batches/${item.id}`)}
      >
        <Text style={styles.batchName}>{item.name}</Text>
        <Text style={styles.batchDescription}>{item.description || 'No description'}</Text>
      </TouchableOpacity>
      <View style={styles.batchActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/batches/edit/${item.id}`)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id, item.name)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Manager</Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/batches/create')}
      >
        <Text style={styles.addButtonText}>Create New Batch</Text>
      </TouchableOpacity>
      
      {batches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No batches created yet</Text>
          <Text style={styles.emptySubtext}>Tap "Create New Batch" to get started</Text>
        </View>
      ) : (
        <FlatList
          data={batches}
          renderItem={renderBatch}
          keyExtractor={(item) => item.id}
          style={styles.batchesList}
        />
      )}
      
      <TouchableOpacity 
        style={styles.attendanceButton}
        onPress={() => router.push('/attendance')}
      >
        <Text style={styles.attendanceButtonText}>Take Attendance</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    height: '100vh',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4285f4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceButton: {
    backgroundColor: '#0f9d58',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  attendanceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  batchesList: {
    flex: 1,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  batchContent: {
    flex: 1,
  },
  batchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  batchDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  batchActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ea4335',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 15,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
});