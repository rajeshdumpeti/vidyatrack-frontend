import type { StudentDto } from "@/types/student.types";

export function filterMockStudents(args: {
  students: StudentDto[];
  search: string;
  sectionId?: number;
}) {
  const query = args.search.trim().toLowerCase();
  const list = args.students.filter((student) =>
    args.sectionId ? student.section_id === args.sectionId : true,
  );

  if (!query) return list;

  return list.filter((student) => {
    const name = (student.name ?? "").toLowerCase();
    const phone = (student.parent_phone ?? "").toLowerCase();
    const roll = String(student.roll_no ?? "").toLowerCase();
    return name.includes(query) || phone.includes(query) || roll.includes(query);
  });
}

export function getSectionLabel(
  sectionId: number | undefined,
  sections: ReadonlyArray<{ id: string; label: string }>,
) {
  return (
    sections.find((item) => item.id === String(sectionId))?.label ??
    `Section ${sectionId}`
  );
}
