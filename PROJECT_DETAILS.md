# Project Details — Cadd Club / My-Batch

This document summarizes the repository: architecture, routing, data models, storage keys, setup, troubleshooting notes, known issues, and recommended next steps.

## Overview

A small Expo + React Native app that manages "batches" (groups) of students and attendance records. The app uses file-based routing (expo-router), local persistence via AsyncStorage, and React state/hooks for UI. It includes platform-specific files for web where necessary.

Project root:
- `app/` — contains all route pages and UI logic
- `assets/` — images used by the app
- `app.json` — Expo configuration
- `package.json` — dependencies and scripts
- `tsconfig.json` — TypeScript config (project is primarily JS/JSX)


## Main libraries and environment

- Expo SDK ~54 (see `package.json`)
- React 19.1.0, React Native 0.81.4
- Expo Router for navigation
- AsyncStorage for client-side persistence (`@react-native-async-storage/async-storage`)
- `uuid` for unique IDs
- `react-native-get-random-values` polyfill to enable `uuid` in RN
- `expo-image-picker`, `@react-native-community/datetimepicker` for other features


## File-based routes (in `app/`)

Top-level pages:
- `app/_layout.jsx` — Router/Stack definitions and app entry-level styles. Also where we've added the `react-native-get-random-values` import to provide crypto.getRandomValues.
- `app/index.jsx` & `app/index.web.jsx` — Home/Batch list (native and web variants). Create, edit, delete batches here.

Batch flows (`app/batches/`):
- `app/batches/create.jsx` — Create new batch. Uses `uuidv4()` to create a batch id and initializes `students_{batchId}` and `attendance_{batchId}` keys.
- `app/batches/[id].jsx` — Batch details and list of students.
- `app/batches/[id]/add-student.jsx` — Add a new student to batch (student `id` is provided by user and used as the unique key for that student).
- `app/batches/[id]/edit-student/[studentId].jsx` — Edit student details; allows changing the student's ID (note: this can cause historical attendance to reference old IDs).
- `app/batches/edit/[id].jsx` — Edit batch metadata (name/description).

Attendance flows (`app/attendance/`):
- `app/attendance/index.jsx` — Choose batch to take attendance for.
- `app/attendance/take/[id].jsx` — Take attendance for a selected batch. Creates an attendance record with a generated `id` (uuid) and stores in `attendance_{batchId}`.
- `app/attendance/history.jsx` — Aggregates attendance across batches and lists records.
- `app/attendance/history/[id].jsx` — Shows details for a single attendance record.


## Data models and storage keys

Storage is entirely local via AsyncStorage with these conventions:

- Batches list: key `batches`
  - Value: Array of batch objects
  - Batch shape: { id: uuid, name: string, description?: string, createdAt: ISOString }

- Students for a batch: key `students_{batchId}`
  - Value: Array of student objects
  - Student shape in the current code: { id: string (user-provided), name: string, createdAt: ISOString }
  - Important: `id` is used as the student unique identifier and may be edited in `edit-student`. That edit does NOT update historical attendance; see Known Issues.

- Attendance for a batch: key `attendance_{batchId}`
  - Value: Array of attendance records
  - Attendance record shape: {
      id: uuid,
      batchId: string,
      batchName: string,
      date: ISOString,
      attendance: [ { studentId: string, present: boolean }, ... ]
    }


## Known issues & fixes

1. crypto.getRandomValues not supported (fix applied)
   - Symptom: When creating a batch, error "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported" appears.
   - Cause: `uuid` requires secure random bytes. In React Native you must provide a getRandomValues polyfill.
   - Fix: Install `react-native-get-random-values` and import it at app entry (done). Steps performed:
     - `npm install react-native-get-random-values`
     - Added `import 'react-native-get-random-values';` to `app/_layout.jsx` (top of file)

2. Metro symbolication logs referencing `InternalBytecode.js` (ENOENT)
   - Symptom: Metro complains it cannot open `InternalBytecode.js` during symbolication.
   - Notes: This usually occurs during symbolication when source maps or stack frames reference an internal/native pseudo-file. It can be transient.
   - Suggested actions: Clear Metro cache and restart (`npx expo start -c`), and inspect stack traces if they keep pointing to the same third-party module.

3. Student ID edits break historical attendance
   - Symptom: If you edit a student's `id` in `edit-student/[studentId].jsx`, historical attendance references the old `studentId`, and `attendance/history/[id].jsx` will show "Unknown Student".
   - Root cause: Attendance records store `studentId` at the time of attendance; student's ID is the only identifier stored for students.
   - Suggested fix: Migrate to an internal immutable UID (uuid) for each student (e.g., `uid`) and keep `studentId` as a mutable display field (e.g., `rollNumber`). Update attendance to reference `uid` instead of `studentId`.


## Developer setup & run instructions

1. Install dependencies:
```powershell
npm install
```

2. (Already done) Make sure `react-native-get-random-values` is installed:
```powershell
npm install react-native-get-random-values
```

3. Start Expo / Metro (clear cache recommended when switching dependencies):
```powershell
npx expo start -c
```

4. Run on Android / iOS / Web (from Expo DevTools or via npm scripts):
```powershell
npm run android
npm run ios
npm run web
```


## Recommended improvements & roadmap

Short term (safe, small changes):
- Replace repeated AsyncStorage code with a storage module (I added `app/utils/storage.js`) to centralize reads/writes.
- Use internal immutable UIDs for students so editing their display ID doesn't break attendance history.
- Add basic tests for the storage helper.
- Improve error handling around AsyncStorage operations (use try/catch and user-friendly alerts).

Medium term (refactor & robustness):
- Add storage versioning and migration helper functions for future schema changes.
- Protect against concurrent writes (simple queue or atomic update patterns).
- Convert key modules to TypeScript to leverage `tsconfig.json` and types.

Long term (features & infra):
- Add a backend service for multi-device sync and authentication.
- Add E2E tests and CI with automated builds.


## Quick reference: important files

- `app/_layout.jsx` — router + polyfill import
- `app/index.jsx` & `app/index.web.jsx` — home screens
- `app/batches/create.jsx` — create batch (calls `uuidv4()`)
- `app/batches/[id]` — batch and student lists
- `app/batches/[id]/add-student.jsx` — add student
- `app/batches/[id]/edit-student/[studentId].jsx` — edit student
- `app/attendance/` — attendance flows
- `app/utils/storage.js` — (added) AsyncStorage helpers


## Contact & next steps
If you want, I can implement one of the recommended improvements now:
- Implement student UID migration and update attendance to use `uid` instead of user-editable `id`.
- Replace AsyncStorage calls across the app with the `app/utils/storage.js` helper.
- Add Jest tests for the storage helper and a small test runner.

Tell me which next step you want me to take and I'll implement it.
