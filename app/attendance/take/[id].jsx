import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

export default function TakeAttendanceScreen() {
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const router = useRouter();
  const { id: batchId } = useLocalSearchParams();

  useEffect(() => {
    loadBatchData();
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      // Load batch details
      const storedBatches = await AsyncStorage.getItem('batches');
      if (storedBatches) {
        const batches = JSON.parse(storedBatches);
        const foundBatch = batches.find(b => b.id === batchId);
        setBatch(foundBatch);
      }
      
      // Load students for this batch
      const storedStudents = await AsyncStorage.getItem(`students_${batchId}`);
      if (storedStudents) {
        const studentsData = JSON.parse(storedStudents);
        setStudents(studentsData);
        
        // Initialize attendance state
        const initialAttendance = {};
        studentsData.forEach(student => {
          initialAttendance[student.id] = true; // Default to present
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = async () => {
    try {
      // Create attendance record
      const attendanceRecord = {
        id: uuidv4(),
        batchId: batchId,
        batchName: batch?.name || 'Unknown Batch',
        date: new Date().toISOString(),
        attendance: Object.keys(attendance).map(studentId => ({
          studentId,
          present: attendance[studentId]
        }))
      };
      
      // Get existing attendance records for this batch
      const storedAttendance = await AsyncStorage.getItem(`attendance_${batchId}`);
      const attendanceRecords = storedAttendance ? JSON.parse(storedAttendance) : [];
      
      // Add new attendance record
      attendanceRecords.push(attendanceRecord);
      
      // Save updated attendance records
      await AsyncStorage.setItem(`attendance_${batchId}`, JSON.stringify(attendanceRecords));
      
      Alert.alert(
        'Success', 
        'Attendance saved successfully', 
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  const renderStudent = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.studentCard, 
        attendance[item.id] ? styles.present : styles.absent
      ]}
      onPress={() => toggleAttendance(item.id)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>ID: {item.id}</Text>
      </View>
      <View style={[
        styles.statusIndicator,
        attendance[item.id] ? styles.presentIndicator : styles.absentIndicator
      ]}>
        <Text style={styles.statusText}>
          {attendance[item.id] ? 'Present' : 'Absent'}
        </Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.presentIndicator]}></View>
          <Text>Tap to mark absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.absentIndicator]}></View>
          <Text>Tap to mark present</Text>
        </View>
      </View>
      
      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students in this batch</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            style={styles.studentsList}
          />
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveAttendance}
          >
            <Text style={styles.saveButtonText}>Save Attendance</Text>
          </TouchableOpacity>
        </>
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
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  presentIndicator: {
    backgroundColor: '#0f9d58',
  },
  absentIndicator: {
    backgroundColor: '#ea4335',
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
  present: {
    borderLeftWidth: 5,
    borderLeftColor: '#0f9d58',
  },
  absent: {
    borderLeftWidth: 5,
    borderLeftColor: '#ea4335',
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
  statusIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4285f4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
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
  },
});