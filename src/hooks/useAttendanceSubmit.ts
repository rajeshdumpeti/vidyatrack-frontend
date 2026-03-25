import { useMutation } from "@tanstack/react-query";
import { createAttendanceRecord, submitAttendance } from "@/api/attendance.api";
import { requireSchoolId } from "@/utils/requireSchoolId";
import type {
  AttendanceStatusDto,
  CreateAttendanceRequest,
} from "@/types/attendance-submit.types";
import { useAuthStore } from "@/store/auth.store";
import { runWithConcurrency } from "@/utils/runWithConcurrency";

export type AttendanceSubmitArgs = {
  sectionId: number;
  dateIso: string; // YYYY-MM-DD
  students: Array<{ studentId: number; status: AttendanceStatusDto }>;
  concurrency?: number; // default 8
};

export function useAttendanceSubmit() {
  const schoolId = useAuthStore((state) => state.schoolId);

  const mutation = useMutation({
    mutationFn: async (args: AttendanceSubmitArgs) => {
      const scopedSchoolId = requireSchoolId(
        schoolId,
        "No active school found. Please select a school first.",
      );

      const concurrency = args.concurrency ?? 8;

      const tasks = args.students.map((s) => {
        const payload: CreateAttendanceRequest = {
          student_id: s.studentId,
          date: args.dateIso,
          status: s.status,
          school_id: scopedSchoolId,
        };

        return () => createAttendanceRecord(payload, scopedSchoolId);
      });

      await runWithConcurrency(tasks, concurrency);

      await submitAttendance(
        {
          section_id: args.sectionId,
          date: args.dateIso,
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
  };
}
