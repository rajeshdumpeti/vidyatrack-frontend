import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { ManagementDashboardPage } from "@/features/management/ManagementDashboardPage";
import { ManageSectionsPage } from "@/features/management/sections/ManageSectionsPage";
import { ManageSchoolsPage } from "@/features/management/schools/ManageSchoolsPage";
import { AssignSubjectsPage } from "@/features/management/setup/AssignSubjectsPage";
import { PrincipalsPage } from "@/features/management/setup/PrincipalsPage";
import { ManagementSetupStudentsPage } from "@/features/management/setup/StudentsPage";
import { SubjectsPage } from "@/features/management/setup/SubjectsPage";
import { TeachersPage } from "@/features/management/setup/TeachersPage";
import { AttendanceHistoryPage } from "@/features/principal/attendance/AttendanceHistoryPage";
import { MarksHistoryPage } from "@/features/principal/marks/MarksHistoryPage";
import { StudentProfilePage } from "@/features/students/StudentProfilePage";
import { TeacherProfilePage } from "@/features/teachers/TeacherProfilePage";
import { TeachersListPage } from "@/features/teachers/TeachersListPage";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { ManagementLayout } from "@/layouts/ManagementLayout";

export const managementRoutes = {
  path: "/management",
  element: (
    <RoleGuard allowed="management">
      <ManagementLayout />
    </RoleGuard>
  ),
  errorElement: <AppErrorBoundary />,
  children: [
    { index: true, element: <ManagementDashboardPage /> },
    { path: "setup/schools", element: <ManageSchoolsPage /> },
    { path: "attendance", element: <AttendanceHistoryPage /> },
    { path: "marks", element: <MarksHistoryPage /> },
    { path: "students", element: <ManagementSetupStudentsPage /> },
    { path: "teachers", element: <TeachersListPage /> },
    { path: "setup/academic", element: <ManageSectionsPage /> },
    { path: "principals", element: <PrincipalsPage /> },
    { path: "setup/students", element: <ManagementSetupStudentsPage /> },
    { path: "students/:studentId", element: <StudentProfilePage /> },
    { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
    { path: "setup/assign-subjects", element: <AssignSubjectsPage /> },
    { path: "setup/subjects", element: <SubjectsPage /> },
    { path: "setup/teachers", element: <TeachersPage /> },
  ],
};
