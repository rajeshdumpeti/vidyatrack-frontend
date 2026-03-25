import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { recordMark, submitMarks } from "@/api/marks.api";
import { requireSchoolId } from "@/utils/requireSchoolId";
import type {
  MarksExamTypeDto,
  RecordMarkRequest,
} from "@/types/marks-submit.types";
import { useAuthStore } from "@/store/auth.store";
import { runWithConcurrency } from "@/utils/runWithConcurrency";

export type MarksSubmitArgs = {
  sectionId: number;
  subjectId: string | number;
  examType: MarksExamTypeDto;
  maxMarks: number;
  students: Array<{ studentId: number; marks: number }>;
  concurrency?: number; // default 8
};

export function useMarksSubmit() {
  const { schoolId } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (args: MarksSubmitArgs) => {
      const scopedSchoolId = requireSchoolId(schoolId);

      const concurrency = args.concurrency ?? 8;

      const tasks = args.students.map((s) => {
        const payload: RecordMarkRequest = {
          student_id: s.studentId,
          subject_id: Number(args.subjectId),
          exam_type: args.examType,
          marks_obtained: s.marks,
          max_marks: args.maxMarks,
        };

        return async () => {
          try {
            return await recordMark(payload, scopedSchoolId);
          } catch (err) {
            if (axios.isAxiosError(err)) {
              const detail = (
                err.response?.data as { detail?: string } | undefined
              )?.detail;
              if (detail === "conflicting_marks") {
                return null;
              }
            }
            throw err;
          }
        };
      });

      await runWithConcurrency(tasks, concurrency);

      await submitMarks(
        {
          section_id: args.sectionId,
          subject_id: args.subjectId,
          exam_type: args.examType,
        },
        scopedSchoolId,
      );

      return { ok: true };
    },
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    isSuccess: mutation.isSuccess,
  };
}
