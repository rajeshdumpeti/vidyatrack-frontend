import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { StudentProfilePage } from "@/features/students/StudentProfilePage";
import { StudentsListPage } from "@/features/students/StudentsListPage";
import { MarkAttendance } from "@/features/teachers/attendance/MarkAttendance";
import { TeacherDashboard } from "@/features/teachers/dashboard/TeacherDashboard";
import { EnterMarks } from "@/features/teachers/marks/EnterMarks";
import { TeacherNotesPage } from "@/features/teachers/TeacherNotesPage";
import { TeacherLayout } from "@/layouts/TeacherLayout";

export const teacherRoutes = {
  path: "/teacher",
  element: (
    <RoleGuard allowed="teacher">
      <TeacherLayout />
    </RoleGuard>
  ),
  errorElement: <AppErrorBoundary />,
  children: [
    { index: true, element: <TeacherDashboard /> },
    { path: "attendance", element: <MarkAttendance /> },
    { path: "marks", element: <EnterMarks /> },
    { path: "notes", element: <TeacherNotesPage /> },
    { path: "students", element: <StudentsListPage /> },
    { path: "students/:studentId", element: <StudentProfilePage /> },
  ],
};
