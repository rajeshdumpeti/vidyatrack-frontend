export type ManagementStudentsSummaryDto = {
  total_students: number;
  girls_count: number;
  boys_count: number;
  other_gender_count: number;
  sections_covered: number;
  classes_covered: number;
  new_admissions_this_month: number;
};

export type ManagementStaffSummaryDto = {
  total_teachers: number;
  active_teachers: number;
  on_leave_teachers: number;
  inactive_teachers: number;
  teachers_with_primary_section: number;
  principal_assigned: boolean;
};
