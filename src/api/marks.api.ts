import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  RecordMarkRequest,
  SubmitMarksRequest,
} from "../types/marks-submit.types";

export async function recordMark(payload: RecordMarkRequest) {
  const res = await apiClient.post(API_ENDPOINTS.marks.record, payload);
  return res.data;
}

export async function submitMarks(payload: SubmitMarksRequest) {
  const res = await apiClient.post(API_ENDPOINTS.marks.submit, payload);
  return res.data;
}
