import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AttendanceDetailScreen() {
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [students, setStudents] = useState([]);
  const router = useRouter();
  const { id: recordId } = useLocalSearchParams();

  useEffect(() => {
    loadAttendanceDetail();
  }, [recordId]);

  const loadAttendanceDetail = async () => {
    try {
      // We need to find the attendance record across all batches
      const storedBatches = await AsyncStorage.getItem('batches');
      if (!storedBatches) return;
      
      const batches = JSON.parse(storedBatches);
      
      for (const batch of batches) {
        const storedAttendance = await AsyncStorage.getItem(`attendance_${batch.id}`);
        if (storedAttendance) {
          const attendanceRecords = JSON.parse(storedAttendance);
          const record = attendanceRecords.find(r => r.id === recordId);
          
          if (record) {
            setAttendanceRecord(record);
            
            // Load students for this batch to get their names
            const storedStudents = await AsyncStorage.getItem(`students_${record.batchId}`);
            if (storedStudents) {
              setStudents(JSON.parse(storedStudents));
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading attendance detail:', error);
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStudent = ({ item }) => (
    <View style={[
      styles.studentCard, 
      item.present ? styles.present : styles.absent
    ]}>
      <Text style={styles.studentName}>{getStudentName(item.studentId)}</Text>
      <Text style={styles.studentId}>ID: {item.studentId}</Text>
      <View style={[
        styles.statusIndicator,
        item.present ? styles.presentIndicator : styles.absentIndicator
      ]}>
        <Text style={styles.statusText}>
          {item.present ? 'Present' : 'Absent'}
        </Text>
      </View>
    </View>
  );

  if (!attendanceRecord) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const presentCount = attendanceRecord.attendance.filter(a => a.present).length;
  const totalCount = attendanceRecord.attendance.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.batchName}>{attendanceRecord.batchName}</Text>
        <Text style={styles.dateText}>{formatDate(attendanceRecord.date)}</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Attendance: {presentCount}/{totalCount} ({percentage}%)
          </Text>
        </View>
      </View>
      
      <FlatList
        data={attendanceRecord.attendance}
        renderItem={renderStudent}
        keyExtractor={(item) => item.studentId}
        style={styles.studentsList}
      />
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
    marginBottom: 15,
  },
  summary: {
    backgroundColor: '#e8f0fe',
    padding: 15,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285f4',
    textAlign: 'center',
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
  presentIndicator: {
    backgroundColor: '#0f9d58',
  },
  absentIndicator: {
    backgroundColor: '#ea4335',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
});