export type ManagementDashboardResponse = {
  success: boolean;
  data: {
    school_selector: Array<{ id: number; name: string; is_selected: boolean }>;
    kpis: {
      total_students: number;
      students_growth_pct: number;
      fee_collected_mtd: number;
      fee_target_pct: number;
      fee_pending: number;
      fee_overdue_days: number;
      total_staff: number;
      new_joiners_this_month: number;
      avg_attendance_pct: number;
      attendance_trend: string;
    };
    fee_chart: Array<{ month: string; actual: number; target: number }>;
    alerts: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      description: string;
      count: number;
      school_id?: number | null;
      action_type: string;
      created_at: string;
    }>;
    school_matrix: Array<{
      school_id: number;
      school_name: string;
      enrollment: number;
      collection: number;
      attendance_pct: number;
      grade: string;
    }>;
    quarterly_outlook: {
      projected_revenue: number;
      growth_forecast_pct: number;
      target_accomplished_pct: number;
    };
    recent_activity: Array<{
      event_type: string;
      description: string;
      performed_by: string;
      performed_at: string;
    }>;
    principal: {
      assigned: boolean;
      principal_id?: number | null;
      name?: string | null;
    };
  };
};

export type ManagementAlertActionResponse = {
  success: boolean;
  message: string;
  action_logged_at: string;
};

export type ManagementAlertHistoryResponse = {
  success: boolean;
  items: Array<{
    event_type: string;
    title: string;
    description: string;
    performed_at: string;
  }>;
};
