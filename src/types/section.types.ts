export type SectionDto = {
  id: number;
  school_id: number;
  class_id: number;
  name: string;

  // If backend returns it, render it; otherwise ignore
  class_name?: string | null;
};
