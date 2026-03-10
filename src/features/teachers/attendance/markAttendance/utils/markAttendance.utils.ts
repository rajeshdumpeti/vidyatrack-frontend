import type { StudentListItem } from "@/types/student.types";

import type { AttendanceCounts, StudentUi } from "../types/markAttendance.types";

export function buildAttendanceStudents(students: StudentListItem[]) {
  return students.map(
    (student, index): StudentUi => ({
      id: String(student.id),
      rollNo:
        student.roll_no != null
          ? String(student.roll_no).padStart(2, "0")
          : String(index + 1).padStart(2, "0"),
      name: student.name,
      initials: student.name
        .split(" ")
        .map((namePart) => namePart[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }),
  );
}

export function getAttendanceCounts(
  students: StudentUi[],
  presentById: Record<string, boolean>,
): AttendanceCounts {
  const total = students.length;
  let present = 0;

  for (const student of students) {
    if (presentById[student.id] !== false) present += 1;
  }

  return { total, present, absent: total - present };
}
