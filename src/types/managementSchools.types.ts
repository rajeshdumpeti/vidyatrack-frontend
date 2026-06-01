export type ManagementSchoolsOverviewResponse = {
  success: boolean;
  data: {
    summary: {
      total_schools: number;
      total_students: number;
      total_staff: number;
      monthly_collection: number;
      pending_collection: number;
    };
    schools: Array<{
      school_id: number;
      school_name: string;
      school_code: string | null;
      status: string;
      board: string | null;
      category: string | null;
      current_session: string | null;
      city: string | null;
      state: string | null;
      principal_name: string | null;
      student_count: number;
      teacher_count: number;
      staff_count: number;
      attendance_pct: number;
      fee_collected_mtd: number;
      fee_pending: number;
      setup_completion_pct: number;
      modules_enabled: string[];
      last_activity_at: string | null;
    }>;
  };
};
