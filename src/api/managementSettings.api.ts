import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";

export type NotificationPreferences = {
  fee_overdue: boolean;
  attendance_drop: boolean;
  staff_appraisal: boolean;
  principal_updates: boolean;
};

export type ManagedUserPasswordReset = {
  success: boolean;
  user_id: number;
  role: string;
  full_name?: string | null;
  login_phone?: string | null;
  login_email?: string | null;
  temp_password: string;
};

export async function getManagementNotificationPreferences(
  schoolId: number,
): Promise<NotificationPreferences> {
  const res = await apiClient.get<NotificationPreferences>(
    API_ENDPOINTS.management.settingsNotifications,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function updateManagementNotificationPreferences(
  schoolId: number,
  payload: NotificationPreferences,
): Promise<NotificationPreferences> {
  const res = await apiClient.patch<NotificationPreferences>(
    API_ENDPOINTS.management.settingsNotifications,
    payload,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function resetManagedUserPassword(
  schoolId: number,
  userId: number,
): Promise<ManagedUserPasswordReset> {
  const res = await apiClient.post<ManagedUserPasswordReset>(
    API_ENDPOINTS.management.settingsResetUserPassword(userId),
    {},
    { params: schoolParams(schoolId) },
  );
  return res.data;
}
