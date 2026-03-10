# VidyaTrack Frontend QA Test Plan

## 1. Document Purpose
This document defines the formal frontend QA approach for VidyaTrack before production release.

It is intended to validate:
- core user journeys
- role-based access behavior
- school-scoped data isolation
- regression safety after the frontend refactor
- correctness of critical mutations and error handling

This plan is structured so QA, engineering, and product can use the same reference during release validation.

## 2. Test Objectives
The QA cycle must answer these questions:
- can every supported role log in and reach the correct landing surface?
- do critical pages load, recover, and navigate correctly?
- do create, update, and submit flows work end to end?
- does the frontend remain scoped to the correct school context?
- do failures present controlled user-facing behavior rather than app instability?

## 3. Scope
### In scope
- authentication
- route access and role guards
- platform workflows
- management setup workflows
- principal workflows
- teacher workflows
- student and teacher detail flows
- CSV import flows
- communications flows
- attendance and marks flows
- responsive behavior for supported viewports

### Out of scope unless separately requested
- backend load testing
- mobile native testing
- penetration testing
- long-duration soak testing
- backend-only admin operations outside frontend paths

## 4. Test Environments
### Required environments
- local development for engineering verification
- staging / pre-production for formal QA
- production smoke validation immediately after release

### Test environment requirements
- stable backend environment
- representative school data
- valid role-based test accounts
- ability to simulate expected error conditions when needed

## 5. Test Roles and Test Data
### Roles to validate
- `super_admin`
- `management`
- `principal`
- `teacher`

### Test data should cover
- single-school and multi-school users
- empty-state schools
- schools with realistic classes, sections, students, and teachers
- at least one school with existing marks and attendance history
- at least one school with communications history
- CSV files for both valid and invalid import scenarios

## 6. Test Strategy
The QA cycle should be executed in three layers.

### Layer 1: Smoke validation
Goal:
- prove the build is basically functional and releasable enough for deeper QA

### Layer 2: Functional regression
Goal:
- validate end-to-end correctness of supported workflows

### Layer 3: Failure-path and edge-case validation
Goal:
- prove the frontend remains stable when data, auth, or network conditions are unfavorable

## 7. Entry and Exit Criteria
### Entry criteria
- release candidate build is available
- backend environment is stable
- required test accounts exist
- release scope is frozen
- known issues are documented

### Exit criteria
- all smoke tests pass
- all P0 and P1 issues are closed
- critical workflows pass for all required roles
- no school-context leakage is observed
- sign-off document is completed

## 8. Smoke Test Suite
### Auth
- login page loads
- OTP request succeeds with valid credentials
- OTP verify succeeds
- invalid OTP path shows controlled error state
- logout works

### Platform
- platform home/dashboard loads
- schools list loads
- school detail loads

### Management
- management dashboard loads
- students setup page loads
- teachers setup page loads
- principals page loads
- subjects page loads
- assign subjects page loads

### Principal
- principal dashboard loads
- attendance history loads
- marks history loads
- communications page loads

### Teacher
- teacher dashboard loads
- attendance page loads
- marks page loads
- communications page loads

## 9. Functional Test Matrix
### 9.1 Authentication
Validate:
- OTP request with valid phone
- OTP request with invalid phone
- OTP verify with valid code
- OTP verify with invalid code
- role-based redirect after successful login
- multi-school selection where applicable
- logout behavior
- refreshing a protected route with a valid session

### 9.2 Platform: Schools
Validate:
- search school by name
- open school detail
- switch detail tabs
- verify people lists render
- create school wizard full completion
- create school validation on each step
- create school final submission
- create school reset / re-entry behavior

### 9.3 Management: Principals
Validate:
- register principal
- verify OTP
- resend OTP
- retry verification path
- confirm history updates after verification
- confirm failure path messaging on bad OTP

### 9.4 Management: Teachers
Validate:
- create teacher with valid class and section data
- validate section dependency behavior
- validate phone formatting / required fields
- verify post-success reset behavior
- verify new teacher appears after create where expected

### 9.5 Management: Students
Validate:
- create student manually
- search and filter list
- pagination where applicable
- navigate to student profile
- open import modal
- preview valid CSV
- preview invalid CSV
- commit import
- verify import summary and row-level errors

### 9.6 Management: Subjects and Assignments
Validate:
- create subject
- search subject
- verify subject usage rendering
- assign teacher to subject in section
- verify row save behavior
- verify bulk save behavior where supported
- verify cache refresh after assignment

### 9.7 Teacher: Attendance
Validate:
- load attendance for the expected class/section
- mark present
- mark absent
- verify optimistic UI updates
- verify failed mutation recovery path
- submit attendance
- verify success handoff or redirect behavior

### 9.8 Teacher: Marks
Validate:
- load assignment context
- select exam type
- hydrate existing marks where available
- enter and edit marks
- validate max marks constraints
- submit marks
- verify success redirect payload / dashboard feedback path

### 9.9 Teacher: Communications
Validate:
- send homework
- verify homework history refresh
- send parent message
- verify recipient selection behavior
- search/select a student for notes
- save note
- verify note history refresh

### 9.10 Principal: Attendance and Marks History
Validate:
- filter attendance history by date and section
- verify summary cards and breakdown tables
- filter marks history by section, subject, and exam
- export filtered marks where applicable
- drill down into linked records where applicable

### 9.11 Principal: Communications
Validate:
- switch tabs
- send homework
- send parent message
- create note
- verify histories load correctly
- verify state resets correctly on context change

### 9.12 Student and Teacher Profiles
Validate:
- open student profile from list
- open teacher profile from list
- verify metadata rendering
- verify notes or assignments render correctly
- verify report-card generation flow
- verify fallback report generation path if API generation fails

## 10. Failure-Path Testing
### Required simulations
- backend unavailable
- network timeout
- invalid OTP
- import preview failure
- import commit failure
- attendance submit failure
- marks submit failure
- missing school context
- 401 / 403 auth failures
- 422 validation or list-history failure

### Validation goals
- no hard crash
- controlled error state shown
- retry remains possible where expected
- no incorrect success toast remains visible after failure
- app shell remains usable

## 11. School Context and Multi-Tenancy Validation
### Required
- verify visible data changes when school context changes
- verify no cross-school leakage in students, teachers, sections, subjects, attendance, or marks
- verify management and principal routes remain correctly scoped
- verify direct-linking into a detail page does not show mismatched school data

## 12. Regression Focus Areas
These areas were heavily refactored and must receive explicit regression attention.

- teacher dashboard
- teacher communications
- teacher attendance
- teacher marks
- principal communications
- principal marks history
- principal attendance history
- platform create school
- management students and CSV import
- management principals
- management assignments
- shared attendance and marks submission hooks
- modular route trees and role guards

## 13. Browser and Viewport Matrix
### Browsers
- Chrome latest
- Safari latest
- Edge latest

### Viewports
- desktop
- tablet
- mobile

### Required result
- no P1 rendering or usability issues in supported combinations

## 14. Defect Severity Model
### P0
- release blocker
- login broken
- data leakage
- app unusable for a role

### P1
- critical workflow broken
- create/update/submit path broken
- severe navigation failure

### P2
- functional issue with workaround
- non-critical UI breakage

### P3
- low-risk cosmetic or copy issue

## 15. Defect Recording Format
Each issue should capture:
- title
- role
- route
- school context used
- browser and viewport
- reproduction steps
- expected result
- actual result
- severity
- screenshot or screen recording
- owner

## 16. Test Execution Log
Track execution with:
- suite name
- owner
- start date
- completion date
- result
- blocked by
- linked defects

## 17. Acceptance Criteria
The release can proceed only if:
- all smoke tests pass
- all critical role workflows pass
- no P0 or P1 issues remain open
- no school-context leakage is found
- auth and role routing are correct
- the tested build is the release candidate build

## 18. QA Sign-Off
- QA owner:
- Build tested:
- Environment tested:
- Result:
- Blocking issues:
- Recommended release decision:
- Date:
