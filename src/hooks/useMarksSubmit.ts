import { useMutation } from "@tanstack/react-query";
import { recordMark, submitMarks } from "..//api/marks.api";
import type {
  MarksExamTypeDto,
  RecordMarkRequest,
} from "../types/marks-submit.types";
import axios from "axios";
type SubmitArgs = {
  sectionId: number;
  subjectId: string | number;
  examType: MarksExamTypeDto;
  students: Array<{ studentId: number; marks: number }>;
  concurrency?: number; // default 8
};

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

export function useMarksSubmit() {
  const mutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      const concurrency = args.concurrency ?? 8;

      const tasks = args.students.map((s) => {
        const payload: RecordMarkRequest = {
          student_id: s.studentId,
          subject_id: Number(args.subjectId),
          exam_type: args.examType,
          marks_obtained: s.marks,
          max_marks: 100,
        };
        return async () => {
          try {
            return await recordMark(payload);
          } catch (err) {
            if (axios.isAxiosError(err)) {
              const detail = (err.response?.data as any)?.detail;
              // Backend signals the record already exists (idempotent retry safe)
              if (detail === "conflicting_marks") {
                return null as unknown;
              }
            }
            throw err;
          }
        };
      });

      // 1) Upsert marks per student (capped concurrency)
      const results = await runWithConcurrency(tasks, concurrency);

      // If every record call was a conflict (or nothing to submit), do not call submit.
      // This avoids backend crashing on empty/duplicate-only submissions.
      const effectiveWrites = results.filter((r) => r != null).length;

      if (effectiveWrites === 0) {
        return { ok: true, skippedSubmit: true };
      }

      await submitMarks({
        section_id: args.sectionId,
        subject_id: args.subjectId,
        exam_type: args.examType,
      });

      return { ok: true, skippedSubmit: false };
    },
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
