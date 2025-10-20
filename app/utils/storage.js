import AsyncStorage from '@react-native-async-storage/async-storage';

const BATCHES_KEY = 'batches';

export async function getBatches() {
    try {
        const raw = await AsyncStorage.getItem(BATCHES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('getBatches error', err);
        return [];
    }
}

export async function setBatches(batches) {
    try {
        await AsyncStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
    } catch (err) {
        console.error('setBatches error', err);
        throw err;
    }
}

export async function getStudents(batchId) {
    try {
        const raw = await AsyncStorage.getItem(`students_${batchId}`);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error(`getStudents ${batchId} error`, err);
        return [];
    }
}

export async function setStudents(batchId, students) {
    try {
        await AsyncStorage.setItem(`students_${batchId}`, JSON.stringify(students));
    } catch (err) {
        console.error(`setStudents ${batchId} error`, err);
        throw err;
    }
}

export async function getAttendance(batchId) {
    try {
        const raw = await AsyncStorage.getItem(`attendance_${batchId}`);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error(`getAttendance ${batchId} error`, err);
        return [];
    }
}

export async function setAttendance(batchId, attendanceRecords) {
    try {
        await AsyncStorage.setItem(`attendance_${batchId}`, JSON.stringify(attendanceRecords));
    } catch (err) {
        console.error(`setAttendance ${batchId} error`, err);
        throw err;
    }
}

export async function removeBatchData(batchId) {
    try {
        await AsyncStorage.removeItem(`students_${batchId}`);
        await AsyncStorage.removeItem(`attendance_${batchId}`);
    } catch (err) {
        console.error(`removeBatchData ${batchId} error`, err);
        throw err;
    }
}

export default {
    getBatches,
    setBatches,
    getStudents,
    setStudents,
    getAttendance,
    setAttendance,
    removeBatchData,
};
