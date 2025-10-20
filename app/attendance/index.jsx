import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AttendanceScreen() {
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

  const renderBatch = ({ item }) => (
    <TouchableOpacity 
      style={styles.batchCard}
      onPress={() => router.push(`/attendance/take/${item.id}`)}
    >
      <Text style={styles.batchName}>{item.name}</Text>
      <Text style={styles.batchDescription}>{item.description || 'No description'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take Attendance</Text>
      <Text style={styles.subtitle}>Select a batch to take attendance</Text>
      
      {batches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No batches available</Text>
          <Text style={styles.emptySubtext}>Create a batch first to take attendance</Text>
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
        style={styles.historyButton}
        onPress={() => router.push('/attendance/history')}
      >
        <Text style={styles.historyButtonText}>View Attendance History</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  batchesList: {
    flex: 1,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  batchDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  historyButton: {
    backgroundColor: '#4285f4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 18,
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