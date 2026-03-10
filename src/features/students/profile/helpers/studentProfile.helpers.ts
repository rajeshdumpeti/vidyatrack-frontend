import type {
  StudentAttendanceSummary,
  StudentProfileDto,
  StudentRecentResult,
  StudentReportCardDto,
} from "@/types/student.types";

import type { StudentRecentResultsGroup } from "../types/studentProfile.types";

export function groupRecentResults(
  recentResults: StudentRecentResult[],
): StudentRecentResultsGroup[] {
  const resultsMap = new Map<string, StudentRecentResult[]>();

  recentResults.forEach((result) => {
    const key =
      String(result.subject_name ?? "Unknown Subject").trim() ||
      "Unknown Subject";
    const list = resultsMap.get(key) ?? [];
    list.push(result);
    resultsMap.set(key, list);
  });

  return Array.from(resultsMap.entries()).map(([subject, exams]) => ({
    subject,
    exams,
  }));
}

export function getHeaderClassSection(student: StudentProfileDto) {
  return student.class_name && student.section_name
    ? `${student.class_name} - ${student.section_name}`
    : student.class_name || student.section_name || "—";
}

export function buildFallbackReportCard(args: {
  student: StudentProfileDto;
  recentResults: StudentRecentResult[];
  attendance: StudentAttendanceSummary | null;
}): StudentReportCardDto {
  const fallbackRows = args.recentResults.map((result) => {
    const maxMarks = result.max_marks ?? 100;
    const obtained = result.marks_obtained ?? 0;
    const percentage = maxMarks
      ? Number(((obtained / maxMarks) * 100).toFixed(2))
      : 0;

    return {
      subject_name: result.subject_name ?? "Subject",
      exam_type: result.exam_type ?? "Exam",
      marks_obtained: obtained,
      max_marks: maxMarks,
      percentage,
      grade:
        percentage >= 90
          ? "A+"
          : percentage >= 80
            ? "A"
            : percentage >= 70
              ? "B"
              : percentage >= 35
                ? "C"
                : "D",
    };
  });

  const totalObtained = fallbackRows.reduce(
    (sum, row) => sum + row.marks_obtained,
    0,
  );
  const totalMax = fallbackRows.reduce((sum, row) => sum + row.max_marks, 0);
  const overallPercentage = totalMax
    ? Number(((totalObtained / totalMax) * 100).toFixed(2))
    : 0;

  return {
    student_id: Number(args.student.id ?? 0),
    student_name: args.student.name ?? "Student",
    student_code: args.student.student_code ?? `ST-${args.student.id ?? ""}`,
    class_name: args.student.class_name ?? null,
    section_name: args.student.section_name ?? null,
    attendance_percentage: args.attendance?.percentage ?? 0,
    present_days: args.attendance?.present_days ?? 0,
    absent_days: args.attendance?.absent_days ?? 0,
    total_days:
      (args.attendance?.present_days ?? 0) + (args.attendance?.absent_days ?? 0),
    total_obtained: totalObtained,
    total_max: totalMax,
    overall_percentage: overallPercentage,
    overall_grade:
      overallPercentage >= 90
        ? "A+"
        : overallPercentage >= 80
          ? "A"
          : overallPercentage >= 70
            ? "B"
            : overallPercentage >= 35
              ? "C"
              : "D",
    generated_at: new Date().toISOString(),
    rows: fallbackRows,
  };
}
