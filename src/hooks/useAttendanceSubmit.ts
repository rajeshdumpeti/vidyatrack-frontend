import { useMutation } from "@tanstack/react-query";
import { createAttendanceRecord, submitAttendance } from "@/api/attendance.api";
import type {
  AttendanceStatusDto,
  CreateAttendanceRequest,
} from "@/types/attendance-submit.types";
import { useAuthStore } from "@/store/auth.store";

type SubmitArgs = {
  sectionId: number;
  dateIso: string; // YYYY-MM-DD
  students: Array<{ studentId: number; status: AttendanceStatusDto }>;
  concurrency?: number; // default 8
  // Removed optional schoolId here because we get it from the Store
};

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

export function useAttendanceSubmit() {
  // FIX: Access the schoolId directly from your store state
  const schoolId = useAuthStore((state) => state.schoolId);

  const mutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      // Safety check: ensure we actually have a school selected
      if (!schoolId) {
        throw new Error(
          "No active school found. Please select a school first.",
        );
      }

      const concurrency = args.concurrency ?? 8;

      // 1) Prepare student record tasks
      const tasks = args.students.map((s) => {
        const payload: CreateAttendanceRequest = {
          student_id: s.studentId,
          date: args.dateIso,
          status: s.status,
          school_id: schoolId, // CRITICAL: Add this to the JSON body
          // Add school_id here if your CreateAttendanceRequest type allows it
          // OR pass it as a second argument if your API function needs it
        };

        // If your createAttendanceRecord function expects (payload, schoolId)
        return () => createAttendanceRecord(payload, schoolId);
      });
      // 2) Create/update per-student records
      await runWithConcurrency(tasks, concurrency);

      // 3) Submit once per section/date using the ID from your store (e.g., 15)
      await submitAttendance(
        {
          section_id: args.sectionId,
          date: args.dateIso,
        },
        schoolId, // This now correctly passes 15
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
  };
}
