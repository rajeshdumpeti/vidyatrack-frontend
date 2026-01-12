import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { PrincipalLayout } from "../layouts/PrincipalLayout";
import { ManagementLayout } from "../layouts/ManagementLayout";
import { OtpRequestPage } from "../features/auth/OtpRequestPage";
import { OtpVerifyPage } from "../features/auth/OtpVerifyPage";
import { RoleGuard } from "../hooks/useRoleGuard";
import { TeacherDashboard } from "../features/teacher/dashboard/TeacherDashboard";
import { MarkAttendance } from "../features/teacher/attendance/MarkAttendance";
import { EnterMarks } from "../features/teacher/marks/EnterMarks";
import { AttendanceHistoryPage } from "../features/principal/attendance/AttendanceHistoryPage";
import { MarksHistoryPage } from "../features/principal/marks/MarksHistoryPage";
import { StudentsListPage } from "../features/principal/students/StudentsListPage";
import { TeachersListPage } from "../features/principal/teachers/TeachersListPage";

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
      { path: "attendance", element: <AttendanceHistoryPage /> },
      { path: "marks", element: <MarksHistoryPage /> },
      { path: "students", element: <StudentsListPage /> },
      { path: "teachers", element: <TeachersListPage /> },
    ],
  },

  { path: "*", element: <div>404</div> },
]);
