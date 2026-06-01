import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { ManagementDashboardPage } from "@/features/management/ManagementDashboardPage";
import { ManagementCommunicationsPage } from "@/features/management/ManagementCommunicationsPage";
import { ManagementProfilePage } from "@/features/management/ManagementProfilePage";
import { ManagementReportsPage } from "@/features/management/ManagementReportsPage";
import { ManagementSettingsPage } from "@/features/management/ManagementSettingsPage";
import { ManagementEnrollmentPage } from "@/features/management/ManagementEnrollmentPage";
import { ManagementAdmissionWizardPage } from "@/features/management/ManagementAdmissionWizardPage";
import { ManagementStaffPage } from "@/features/management/ManagementStaffPage";
import { ManageSchoolsPage } from "@/features/management/schools/ManageSchoolsPage";
import { ManagementSetupChecklistPage } from "@/features/management/setup/ManagementSetupChecklistPage";
import { ManagementSetupFeeStructurePage } from "@/features/management/setup/ManagementSetupFeeStructurePage";
import { ManagementSetupSectionsPage } from "@/features/management/setup/ManagementSetupSectionsPage";
import { ManagementSetupSubjectsPage } from "@/features/management/setup/ManagementSetupSubjectsPage";
import { AssignSubjectsPage } from "@/features/management/setup/AssignSubjectsPage";
import { PrincipalsPage } from "@/features/management/setup/PrincipalsPage";
import { ManagementSetupStudentsPage } from "@/features/management/setup/StudentsPage";
import { TeachersPage } from "@/features/management/setup/TeachersPage";
import { ManagementFeesPage } from "@/features/fees/ManagementFeesPage";
import { FeeReceiptPage } from "@/features/fees/FeeReceiptPage";
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
    { path: "profile", element: <ManagementProfilePage /> },
    { path: "settings", element: <ManagementSettingsPage /> },
    { path: "schools", element: <ManageSchoolsPage /> },
    { path: "setup/schools", element: <ManageSchoolsPage /> },
    { path: "enrollment", element: <ManagementEnrollmentPage /> },
    { path: "enrollment/new", element: <ManagementAdmissionWizardPage /> },
    { path: "enrollment/:studentId/complete", element: <ManagementAdmissionWizardPage /> },
    { path: "staff", element: <ManagementStaffPage /> },
    { path: "attendance", element: <AttendanceHistoryPage /> },
    { path: "marks", element: <MarksHistoryPage /> },
    { path: "fees", element: <ManagementFeesPage /> },
    { path: "communication", element: <ManagementCommunicationsPage /> },
    { path: "fees/receipt/:paymentId", element: <FeeReceiptPage /> },
    { path: "reports", element: <ManagementReportsPage /> },
    { path: "setup", element: <ManagementSetupChecklistPage /> },
    { path: "students", element: <ManagementSetupStudentsPage /> },
    { path: "teachers", element: <TeachersListPage /> },
    { path: "setup/sections", element: <ManagementSetupSectionsPage /> },
    { path: "setup/academic", element: <ManagementSetupSectionsPage /> },
    { path: "principals", element: <PrincipalsPage /> },
    { path: "setup/students", element: <ManagementSetupStudentsPage /> },
    { path: "students/:studentId", element: <StudentProfilePage /> },
    { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
    { path: "setup/assign-subjects", element: <AssignSubjectsPage /> },
    { path: "setup/subjects", element: <ManagementSetupSubjectsPage /> },
    { path: "setup/fee-structure", element: <ManagementSetupFeeStructurePage /> },
    { path: "setup/teachers", element: <TeachersPage /> },
  ],
};
