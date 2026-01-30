import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { recordMark, submitMarks } from "@/api/marks.api";
import type {
  MarksExamTypeDto,
  RecordMarkRequest,
} from "@/types/marks-submit.types";
import { useAuthStore } from "@/store/auth.store";

type SubmitArgs = {
  sectionId: number;
  subjectId: string | number;
  examType: MarksExamTypeDto;
  students: Array<{ studentId: number; marks: number }>;
  concurrency?: number; // default 8
};

/**
 * Utility to process promises in batches to avoid overwhelming the server
 * and to stay within database connection limits.
 */
async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
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
  const { schoolId } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      // 1. Safety check for the school context
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }

      const concurrency = args.concurrency ?? 8;

      // 2. Map students to recording tasks
      const tasks = args.students.map((s) => {
        const payload: RecordMarkRequest = {
          student_id: s.studentId,
          subject_id: Number(args.subjectId),
          exam_type: args.examType,
          marks_obtained: s.marks,
          max_marks: 100, // Assuming 100 as standard max
        };

        return async () => {
          try {
            // Pass the schoolId as required by our updated API
            return await recordMark(payload, schoolId);
          } catch (err) {
            // Idempotency: If the mark is already recorded, we ignore the conflict
            if (axios.isAxiosError(err)) {
              const detail = (err.response?.data as any)?.detail;
              if (detail === "conflicting_marks") {
                return null;
              }
            }
            throw err;
          }
        };
      });

      // 3. Execute student record upserts with capped concurrency
      await runWithConcurrency(tasks, concurrency);

      // 4. Finalize the submission for the whole section
      // This triggers the backend notification logic
      await submitMarks(
        {
          section_id: args.sectionId,
          subject_id: args.subjectId,
          exam_type: args.examType,
        },
        schoolId,
      );

      return { ok: true };
    },
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isPending: mutation.isPending, // Using TanStack v5 naming
    error: mutation.error,
    reset: mutation.reset,
    isSuccess: mutation.isSuccess,
  };
}
