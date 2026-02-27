import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";
import type { Subject } from "@/types/subject.types";

export type AcademicSetupDto = {
  school_id: number;
  classes: ClassDto[];
  sections: SectionDto[];
  subjects: Subject[];
};

