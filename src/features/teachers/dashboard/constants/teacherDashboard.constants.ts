import type { TeacherDashboardAction } from "../types/teacherDashboard.types";

export const TEACHER_DASHBOARD_ACTIONS: TeacherDashboardAction[] = [
  {
    id: "attendance",
    label: "Mark Attendance",
    route: "/teacher/attendance",
  },
  {
    id: "marks",
    label: "Enter Marks",
    route: "/teacher/marks",
  },
  {
    id: "notes",
    label: "Write Student Note",
    route: "/teacher/notes",
  },
];

export const TEACHER_DASHBOARD_FOOTER_TEXT =
  "School Management System © 2026. All rights reserved.";
