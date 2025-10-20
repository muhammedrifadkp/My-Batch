import React from 'react';
// Polyfill required so `uuid` (v4) can use secure random bytes in React Native
// Install with: npm install react-native-get-random-values
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4285f4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Attendance Manager',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="batches/create"
        options={{
          title: 'Create Batch',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="batches/[id]"
        options={{
          title: 'Batch Details',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="batches/edit/[id]"
        options={{
          title: 'Edit Batch',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="batches/[id]/add-student"
        options={{
          title: 'Add Student',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="batches/[id]/edit-student/[studentId]"
        options={{
          title: 'Edit Student',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="attendance/index"
        options={{
          title: 'Attendance',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="attendance/take/[id]"
        options={{
          title: 'Take Attendance',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="attendance/history"
        options={{
          title: 'Attendance History',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="attendance/history/[id]"
        options={{
          title: 'Attendance Details',
          headerBackTitle: 'Back'
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});