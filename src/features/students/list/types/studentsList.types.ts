import type { StudentDto, StudentListItem } from "@/types/student.types";

export type StudentsListPagination<TStudent> = {
  pagedItems: TStudent[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

export type StudentsListPrincipalState = {
  students: StudentDto[];
  pagination: StudentsListPagination<StudentDto>;
};

export type StudentsListTeacherState = {
  students: StudentListItem[];
  pagination: StudentsListPagination<StudentListItem>;
};
