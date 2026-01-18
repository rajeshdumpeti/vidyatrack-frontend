import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { PrincipalLayout } from "@/layouts/PrincipalLayout";
import { ManagementLayout } from "@/layouts/ManagementLayout";
import { OtpRequestPage } from "@/features/auth/OtpRequestPage";
import { OtpVerifyPage } from "@/features/auth/OtpVerifyPage";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { TeacherDashboard } from "@/features/teachers/dashboard/TeacherDashboard";
import { MarkAttendance } from "@/features/teachers/attendance/MarkAttendance";
import { EnterMarks } from "@/features/teachers/marks/EnterMarks";
import { AttendanceHistoryPage } from "@/features/principal/attendance/AttendanceHistoryPage";
import { MarksHistoryPage } from "@/features/principal/marks/MarksHistoryPage";
import { StudentsListPage } from "@/features/students/StudentsListPage";
import { TeachersListPage } from "@/features/teachers/TeachersListPage";
import { ManageSchoolsPage } from "@/features/management/schools/ManageSchoolsPage";
import { ManageClassesPage } from "@/features/management/classes/ManageClassesPage";
import { ManageSectionsPage } from "@/features/management/sections/ManageSectionsPage";
import { StudentProfilePage } from "@/features/students/StudentProfilePage";
import { TeacherProfilePage } from "@/features/teachers/TeacherProfilePage";
import { AssignSubjectsPage } from "@/features/management/setup/AssignSubjectsPage";
import { SubjectsPage } from "@/features/management/setup/SubjectsPage";
import { TeachersPage } from "@/features/management/setup/TeachersPage";
import { StudentsSetupPage } from "@/features/management/setup/StudentsSetupPage";
import { ManagementSetupStudentsPage } from "@/features/management/setup/StudentsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth/login" replace /> },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <OtpRequestPage />,
      },
      { path: "verify", element: <OtpVerifyPage /> },
    ],
  },

  {
    path: "/teacher",
    element: (
      <RoleGuard allowed="teacher">
        <TeacherLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <TeacherDashboard /> },
      { path: "attendance", element: <MarkAttendance /> },
      { path: "marks", element: <EnterMarks /> },
      { path: "students", element: <StudentsListPage /> },
      { path: "students/:studentId", element: <StudentProfilePage /> },
    ],
  },

  {
    path: "/principal",
    element: (
      <RoleGuard allowed="principal">
        <PrincipalLayout />
      </RoleGuard>
    ),

    children: [
      { index: true, element: <div>Principal Home (UI TBD)</div> },
      { path: "attendance", element: <AttendanceHistoryPage /> },
      { path: "marks", element: <MarksHistoryPage /> },
      { path: "students", element: <StudentsListPage /> },
      { path: "teachers", element: <TeachersListPage /> },
      { path: "students/:studentId", element: <StudentProfilePage /> },
      { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
    ],
  },

  {
    path: "/management",
    element: (
      <RoleGuard allowed="management">
        <ManagementLayout />
      </RoleGuard>
    ),

    children: [
      { index: true, element: <div>Management Home (UI TBD)</div> },
      { path: "setup/schools", element: <ManageSchoolsPage /> },
      { path: "attendance", element: <AttendanceHistoryPage /> },
      { path: "marks", element: <MarksHistoryPage /> },
      { path: "students", element: <StudentsSetupPage /> },
      { path: "teachers", element: <TeachersListPage /> },
      { path: "setup/classes", element: <ManageClassesPage /> },
      { path: "setup/sections", element: <ManageSectionsPage /> },
      {
        path: "setup/students",
        element: <ManagementSetupStudentsPage />,
      },
      { path: "students/:studentId", element: <StudentProfilePage /> },
      { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
      { path: "setup/assign-subjects", element: <AssignSubjectsPage /> },
      { path: "setup/subjects", element: <SubjectsPage /> },
      { path: "setup/teachers", element: <TeachersPage /> },
    ],
  },

  { path: "*", element: <div>404</div> },
]);
