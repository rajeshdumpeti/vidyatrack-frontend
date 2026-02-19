import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  HomeworkCreateRequest,
  ParentMessageRequest,
  HomeworkRecordDto,
  ParentMessageRecordDto,
} from "@/types/communications.types";

export async function sendHomework(
  payload: HomeworkCreateRequest,
  schoolId: number,
) {
  const res = await apiClient.post(API_ENDPOINTS.communications.homework, payload, {
    params: { school_id: schoolId },
  });
  return res.data;
}

export async function sendParentMessage(
  payload: ParentMessageRequest,
  schoolId: number,
) {
  const res = await apiClient.post(
    API_ENDPOINTS.communications.parentMessage,
    payload,
    { params: { school_id: schoolId } },
  );
  return res.data;
}

export async function listHomework(params: {
  schoolId: number;
  sectionId?: number;
  subjectId?: number;
}): Promise<HomeworkRecordDto[]> {
  const res = await apiClient.get(
    API_ENDPOINTS.communications.homework,
    {
      params: {
        school_id: params.schoolId,
        section_id: params.sectionId,
        subject_id: params.subjectId,
      },
    },
  );
  const data = res.data as
    | HomeworkRecordDto[]
    | { items?: HomeworkRecordDto[]; data?: HomeworkRecordDto[] };
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function listParentMessages(params: {
  schoolId: number;
  sectionId?: number;
}): Promise<ParentMessageRecordDto[]> {
  const res = await apiClient.get(
    API_ENDPOINTS.communications.parentMessage,
    {
      params: {
        school_id: params.schoolId,
        section_id: params.sectionId,
      },
    },
  );
  const data = res.data as
    | ParentMessageRecordDto[]
    | { items?: ParentMessageRecordDto[]; data?: ParentMessageRecordDto[] };
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
