import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";

export function exportMarksHistoryCsv(args: {
  rows: PrincipalMarksRowDto[];
  examType: string;
}) {
  if (!args.rows.length) return;

  const lines = [
    [
      "student_id",
      "student_name",
      "roll_no",
      "class_name",
      "section_name",
      "subject",
      "exam_type",
      "marks_obtained",
      "max_marks",
    ].join(","),
    ...args.rows.map((row) =>
      [
        row.student_id,
        `"${(row.student_name ?? "").replace(/"/g, '""')}"`,
        row.roll_no ?? "",
        `"${(row.class_name ?? "").replace(/"/g, '""')}"`,
        `"${(row.section_name ?? "").replace(/"/g, '""')}"`,
        `"${(row.subject_name ?? "").replace(/"/g, '""')}"`,
        row.exam_type,
        row.marks_obtained,
        row.max_marks,
      ].join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `marks_${args.examType.toLowerCase()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
