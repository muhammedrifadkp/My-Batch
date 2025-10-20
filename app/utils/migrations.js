import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
    getBatches,
    getStudents,
    setStudents,
    getAttendance,
    setAttendance,
} from './storage';

const STORAGE_VERSION_KEY = '__storage_version';

async function getStorageVersion() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
        return raw ? parseInt(raw, 10) : 1;
    } catch (err) {
        console.error('getStorageVersion error', err);
        return 1;
    }
}

async function setStorageVersion(version) {
    try {
        await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(version));
    } catch (err) {
        console.error('setStorageVersion error', err);
        throw err;
    }
}

/**
 * Migrate storage from v1 -> v2
 * - students: replace user-provided id with immutable uid, keep old id as rollNo
 * - attendance: replace attendance[].studentId with attendance[].uid
 */
export async function migrate_v1_to_v2() {
    console.log('Starting migrate_v1_to_v2');
    const batches = await getBatches();

    for (const batch of batches) {
        const batchId = batch.id;
        try {
            const students = await getStudents(batchId);
            const attendanceRecords = await getAttendance(batchId);

            // Mapping from oldId -> uid
            const idMap = {};
            const newStudents = [];

            // Convert existing students
            for (const s of students) {
                // If student already has uid, skip conversion
                if (s && s.uid) {
                    idMap[s.rollNo ?? s.id] = s.uid;
                    newStudents.push(s);
                    continue;
                }

                const oldId = s && s.id ? String(s.id) : undefined;
                const uid = uuidv4();
                const now = new Date().toISOString();

                const migrated = {
                    uid,
                    rollNo: oldId ?? '',
                    name: s && s.name ? s.name : 'Unknown',
                    createdAt: s && s.createdAt ? s.createdAt : now,
                    updatedAt: now,
                };

                if (oldId) idMap[oldId] = uid;
                newStudents.push(migrated);
            }

            // Process attendance records
            for (const rec of attendanceRecords) {
                if (!rec || !Array.isArray(rec.attendance)) continue;

                for (const a of rec.attendance) {
                    // old student id may be in `studentId`
                    const oldId = a.studentId ? String(a.studentId) : undefined;

                    if (oldId && idMap[oldId]) {
                        a.uid = idMap[oldId];
                    } else if (oldId) {
                        // Create placeholder student and mapping
                        const placeholderUid = uuidv4();
                        const now = new Date().toISOString();
                        const placeholder = {
                            uid: placeholderUid,
                            rollNo: oldId,
                            name: 'Unknown',
                            createdAt: now,
                            updatedAt: now,
                        };
                        idMap[oldId] = placeholderUid;
                        newStudents.push(placeholder);
                        a.uid = placeholderUid;
                    } else {
                        // No oldId found; create a generated uid and mark unknown
                        const genUid = uuidv4();
                        a.uid = genUid;
                    }

                    // remove old studentId prop if present
                    if (a.hasOwnProperty('studentId')) {
                        delete a.studentId;
                    }
                }
            }

            // Save migrated students and attendance back to storage
            await setStudents(batchId, newStudents);
            await setAttendance(batchId, attendanceRecords);
        } catch (err) {
            console.error(`Migration error for batch ${batchId}:`, err);
            // continue with next batch
        }
    }

    // finally set storage version to 2
    await setStorageVersion(2);
    console.log('migrate_v1_to_v2 completed');
}

export async function runMigrations() {
    try {
        const version = await getStorageVersion();
        console.log('current storage version', version);
        if (version < 2) {
            await migrate_v1_to_v2();
        }
    } catch (err) {
        console.error('runMigrations error', err);
        throw err;
    }
}

export default { runMigrations, migrate_v1_to_v2 };
