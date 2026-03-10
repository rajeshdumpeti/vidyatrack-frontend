export type PlatformSchoolDetailTabKey =
  | "overview"
  | "teachers"
  | "students"
  | "staff";

export type PlatformSchoolDashboardMetrics = {
  teachers: number;
  students: number;
  staff: number;
  total: number;
};

export type PlatformSchoolPersonRow = {
  id: number;
  name: string;
  role?: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  extra?: string;
};
