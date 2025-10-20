import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AttendanceHistoryScreen() {
  const [batches, setBatches] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    try {
      // Load all batches
      const storedBatches = await AsyncStorage.getItem('batches');
      const batchesData = storedBatches ? JSON.parse(storedBatches) : [];
      setBatches(batchesData);
      
      // Load attendance records for all batches
      const allAttendanceRecords = [];
      
      for (const batch of batchesData) {
        const storedAttendance = await AsyncStorage.getItem(`attendance_${batch.id}`);
        if (storedAttendance) {
          const attendanceData = JSON.parse(storedAttendance);
          allAttendanceRecords.push(...attendanceData);
        }
      }
      
      // Sort by date (newest first)
      allAttendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceRecords(allAttendanceRecords);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  const calculateAttendanceStats = (attendanceArray) => {
    const total = attendanceArray.length;
    const present = attendanceArray.filter(a => a.present).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, total, percentage };
  };

  const renderAttendanceRecord = ({ item }) => {
    const stats = calculateAttendanceStats(item.attendance);
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.batchName}>{getBatchName(item.batchId)}</Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {stats.present}/{stats.total} students ({stats.percentage}%)
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => router.push(`/attendance/history/${item.id}`)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      
      {attendanceRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance records found</Text>
          <Text style={styles.emptySubtext}>Take attendance to see records here</Text>
        </View>
      ) : (
        <FlatList
          data={attendanceRecords}
          renderItem={renderAttendanceRecord}
          keyExtractor={(item) => item.id}
          style={styles.recordsList}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordsList: {
    flex: 1,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  batchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 16,
    color: '#444',
  },
  detailsButton: {
    backgroundColor: '#4285f4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
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