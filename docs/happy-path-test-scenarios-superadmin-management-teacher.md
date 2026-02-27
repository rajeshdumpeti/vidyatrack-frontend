# VidyaTrack Happy Path Test Scenarios

Date: 2026-02-26
Purpose: End-to-end happy path for 3 roles: Super Admin, Management, Teacher.

## 1. Scope

This document covers only success paths:
1. Super Admin login and school creation.
2. Management login and school setup.
3. Teacher login and daily academic operations.

Hard-stop/error scenarios are intentionally excluded.

## 2. Environment and Test Data

## 2.1 Services Required
1. Frontend running on Vite.
2. Backend API running on port 8000.
3. Database connected.
4. Strapi running (for login CMS) or fallback defaults available.
5. OTP mode configured for local:
   - `OTP_DELIVERY_MODE=local_log_only` in backend `.env` for localhost testing.

## 2.2 Core Test Users
Use unique numbers that are not already assigned.

1. Super Admin user:
   - Phone: `+16190000099`
   - Email: `rajesh05db@gmail.com`
   - Role: `super_admin`
2. Management user:
   - Created automatically when Super Admin creates school (admin_phone).
3. Teacher user:
   - Created by Management from Teacher setup screen.

## 2.3 Suggested Seed SQL (Super Admin)
```sql
INSERT INTO users (phone, email, role, is_active, can_create_school, max_schools)
VALUES ('+16190000099', 'rajesh05db@gmail.com', 'super_admin', true, true, NULL);
```

## 3. Super Admin Happy Path

## 3.1 Login (OTP)
1. Open `/auth/login`.
2. Select country code `+1`.
3. Enter phone digits: `6190000099`.
4. Click `Send OTP`.
5. From backend terminal, copy OTP (local mode log line).
6. Enter 4-digit OTP in `/auth/verify`.

Expected:
1. OTP verify succeeds.
2. User lands on `/platform`.

## 3.2 Create School (Platform)
Navigate to `/platform/schools/new`.

Fill these fields at minimum for successful progression:

### Step 1: School Identity
1. School Name: `Vidyatrack Public School`
2. School Code: `VTPS001`
3. Board: `CBSE`
4. Category: `secondary`
5. Medium: `English`
6. Type: `co_educational`

### Step 2: Location & Contact
1. City: `San Diego`
2. State: `California`
3. Pin Code: `560034` (UI expects 6 digits)
4. School Phone: `9876543210` (>=10 digits)
5. School Email: `contact@vtps.edu`

### Step 3: Management Admin
1. First Name: `Maya`
2. Last Name: `Rao`
3. Management Admin Phone: `9876501234` (>=10 digits)
4. Management Admin Email: `maya.rao@vtps.edu`

### Step 4: Academic Baseline
1. Current Session: `2025-2026`
2. Academic Start Month: `April`
3. Academic End Month: `March`
4. Working Days Per Week: `6`
5. Class Levels: select at least one (example: `1`, `2`, `3`, `4`, `5`)

### Step 5: Modules & Limits
1. At least one module enabled.
2. Max Students > 0.
3. Max Teachers > 0.
4. Max Staff > 0.
5. Storage Limit (GB) > 0.

### Step 6: Review & Confirm
1. Click `Confirm & Onboard School`.

Expected:
1. Redirect to `/platform/schools`.
2. New school visible in school list.
3. Management admin login identity is created on backend with provided admin phone.

## 4. Management Happy Path

## 4.1 Login as Management
1. Open `/auth/login`.
2. Select country code matching management phone.
3. Enter phone from school creation Step 3 (`9876501234`).
4. Send OTP and verify using backend terminal OTP.

Expected:
1. If one school mapped, land on `/management`.
2. If multiple schools mapped, land on `/auth/select-school`; choose school; then land on `/management`.

## 4.2 Setup Academic Structure

### A. Create Class and Section
Page: `/management/setup/academic`

1. Quick Add class name: `Grade 5`.
2. Click `Create Class`.
3. Select `Grade 5` in class list.
4. Add section name: `A`.
5. Click `Add Section`.

Expected:
1. Class appears in left panel.
2. Section appears under selected class.

### B. Create Subjects
Page: `/management/setup/subjects`

Add at least 2 subjects:
1. `Mathematics`
2. `Science`

Expected:
1. Subjects visible in repository list.

### C. Create Teacher
Page: `/management/setup/teachers`

Required fields:
1. Name: `Anita Verma`
2. Phone: `9876509999` (exact 10 digits)
3. Target Class: `Grade 5`
4. Target Section: `A`
5. Email (optional): `anita.verma@vtps.edu`

Click `Create Teacher`.

Expected:
1. Success message `Teacher created successfully`.
2. Teacher visible in list.

### D. Assign Subject to Teacher
Page: `/management/setup/assign-subjects`

1. Select class `Grade 5`.
2. Select section `A`.
3. For `Mathematics`, choose `Anita Verma`.
4. Click assign.

Expected:
1. Row shows `Assigned successfully`.
2. Assignment persists after refresh.

### E. Add Student
Page: `/management/setup/students`

Minimum working payload:
1. First Name: `Rohan`
2. Last Name: `Kumar`
3. Class: `Grade 5`
4. Section: `A`
5. Parent Name: `Suresh Kumar`
6. Parent Phone: `9876511111` (>=10 digits)
7. Roll Number: `1`

Click `Add Student`.

Expected:
1. Student appears in students list.
2. Student shows linked class-section.

## 5. Teacher Happy Path

## 5.1 Login as Teacher
1. Open `/auth/login`.
2. Enter teacher phone from creation (`9876509999`) with correct country code.
3. Send OTP and verify using backend terminal OTP.

Expected:
1. Redirect to `/teacher` dashboard.
2. Teacher section context is resolved.

## 5.2 Mark Attendance
Page: `/teacher/attendance`

1. Confirm class/section context shown.
2. Keep first student as `Present` (default) or toggle to `Absent` and back.
3. Click `Submit Attendance`.

Expected:
1. Submission success modal appears.
2. Redirect back to `/teacher` with success state.
3. Management attendance page reflects submitted records.

## 5.3 Enter Marks
Page: `/teacher/marks`

1. Assessment Type: `Unit Test`.
2. For student `Rohan`, enter marks: `85`.
3. Click `Submit Marks`.
4. Confirm in final modal: `Yes, Submit Marks`.

Expected:
1. Submission succeeds.
2. Redirect to `/teacher` with success state.
3. Management marks history shows submitted marks.

## 5.4 Teacher Communications (Optional but Happy Path)
Page: `/teacher/notes`

### Homework
1. Homework Title: `Math Practice - Fractions`
2. Due Date: any future date
3. Details: `Solve worksheet questions 1 to 10.`
4. Click `Send Homework`.

Expected: success toast and entry in homework timeline.

### Parent Message
1. Select at least one student/parent.
2. Subject: `Weekly Progress`
3. Message: `Rohan is doing well. Please review chapter 3 at home.`
4. Click `Send Message`.

Expected: success toast and entry in parent message timeline.

### Student Note
1. Select student `Rohan`.
2. Note text: `Shows strong participation.`
3. Click `Save Note`.

Expected: note appears in notes timeline.

## 6. End-to-End Validation Checklist

Mark PASS only if all are true:
1. Super Admin login successful via OTP.
2. School created from platform wizard.
3. Management can login with school-admin phone.
4. Management can create class and section.
5. Management can create subjects.
6. Management can create teacher.
7. Management can assign subject to teacher.
8. Management can add student to section.
9. Teacher can login.
10. Teacher can submit attendance.
11. Teacher can submit marks.
12. Teacher can send homework, parent message, and student note.

## 7. Notes for Local OTP Mode

1. Keep local mode in backend `.env`:
   - `OTP_DELIVERY_MODE=local_log_only`
2. Restart backend after any `.env` change.
3. OTP is read from backend terminal logs.
4. For test/stage/prod, set back to:
   - `OTP_DELIVERY_MODE=provider`
