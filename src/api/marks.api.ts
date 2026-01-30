import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  RecordMarkRequest,
  SubmitMarksRequest,
} from "@/types/marks-submit.types";

// Update these to accept schoolId
export async function recordMark(payload: RecordMarkRequest, schoolId: number) {
  const res = await apiClient.post(
    API_ENDPOINTS.marks.record,
    payload,
    { params: { school_id: schoolId } }, // Explicitly add school_id to the URL
  );
  return res.data;
}

export async function submitMarks(
  payload: SubmitMarksRequest,
  schoolId: number,
) {
  const res = await apiClient.post(
    API_ENDPOINTS.marks.submit,
    payload,
    { params: { school_id: schoolId } }, // Explicitly add school_id to the URL
  );
  return res.data;
}
