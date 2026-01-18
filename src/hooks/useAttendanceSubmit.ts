import { useMutation } from "@tanstack/react-query";
import { createAttendanceRecord, submitAttendance } from "@/api/attendance.api";
import type {
  AttendanceStatusDto,
  CreateAttendanceRequest,
} from "@/types/attendance-submit.types";

type SubmitArgs = {
  sectionId: number;
  dateIso: string; // YYYY-MM-DD
  students: Array<{ studentId: number; status: AttendanceStatusDto }>;
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

export function useAttendanceSubmit() {
  const mutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      const concurrency = args.concurrency ?? 8;

      const tasks = args.students.map((s) => {
        const payload: CreateAttendanceRequest = {
          student_id: s.studentId,
          date: args.dateIso,
          status: s.status,
        };
        return () => createAttendanceRecord(payload);
      });

      // 1) Create/update per-student records (capped concurrency)
      await runWithConcurrency(tasks, concurrency);

      // 2) Submit once per section/date
      await submitAttendance({
        section_id: args.sectionId,
        date: args.dateIso,
      });

      return { ok: true };
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
