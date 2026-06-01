import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { PrincipalDashboardPage } from "@/features/principal/PrincipalDashboardPage";
import { PrincipalCommunicationsPage } from "@/features/principal/PrincipalCommunicationsPage";
import { AttendanceHistoryPage } from "@/features/principal/attendance/AttendanceHistoryPage";
import { MarksHistoryPage } from "@/features/principal/marks/MarksHistoryPage";
import { StudentProfilePage } from "@/features/students/StudentProfilePage";
import { StudentsListPage } from "@/features/students/StudentsListPage";
import { TeacherProfilePage } from "@/features/teachers/TeacherProfilePage";
import { TeachersListPage } from "@/features/teachers/TeachersListPage";
import { PrincipalFeesPage } from "@/features/fees/PrincipalFeesPage";
import { FeeReceiptPage } from "@/features/fees/FeeReceiptPage";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { PrincipalLayout } from "@/layouts/PrincipalLayout";

export const principalRoutes = {
  path: "/principal",
  element: (
    <RoleGuard allowed="principal">
      <PrincipalLayout />
    </RoleGuard>
  ),
  errorElement: <AppErrorBoundary />,
  children: [
    { index: true, element: <PrincipalDashboardPage /> },
    { path: "attendance", element: <AttendanceHistoryPage /> },
    { path: "marks", element: <MarksHistoryPage /> },
    { path: "communication", element: <PrincipalCommunicationsPage /> },
    { path: "fees", element: <PrincipalFeesPage /> },
    { path: "fees/receipt/:paymentId", element: <FeeReceiptPage /> },
    { path: "students", element: <StudentsListPage /> },
    { path: "teachers", element: <TeachersListPage /> },
    { path: "students/:studentId", element: <StudentProfilePage /> },
    { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
  ],
};
