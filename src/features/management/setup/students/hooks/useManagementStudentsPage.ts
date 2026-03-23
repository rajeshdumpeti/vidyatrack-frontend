/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import {
  useCommitStudentsImport,
  useCreateStudent,
  usePreviewStudentsImport,
  useStudents,
} from "@/hooks/useStudents";
import type {
  StudentCreateInput,
  StudentDto,
  StudentImportCommitResponse,
  StudentImportPreviewResponse,
} from "@/types/student.types";

import {
  mapImportError,
  normalizePhoneDigits,
} from "../helpers/managementStudents.helpers";
import type { CreateFormValues } from "../types/managementStudents.types";

export function useManagementStudentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [page, setPage] = useState(1);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleSectionChange = (v: string) => { setSectionId(v); setPage(1); };
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewData, setPreviewData] =
    useState<StudentImportPreviewResponse | null>(null);
  const [commitResult, setCommitResult] =
    useState<StudentImportCommitResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const sectionIdNumber = sectionId ? Number(sectionId) : null;
  const studentsQuery = useStudents({
    page,
    limit: 20,
    search,
    sectionId: sectionIdNumber,
  });
  const classesQuery = useClasses();
  const sectionsQuery = useSections();
  const classesList = classesQuery.list;
  const sectionsList = sectionsQuery.list;
  const createMutation = useCreateStudent();
  const previewImportMutation = usePreviewStudentsImport();
  const commitImportMutation = useCommitStudentsImport();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      name: "",
      class_id: "",
      section_id: "",
      parent_phone: "",
      parent_name: "",
      date_of_birth: "",
      gender: "",
      roll_number: "",
      admission_date: "",
    },
    mode: "onBlur",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedClassId = watch("class_id");

  const classLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (classesList.data ?? []).forEach((item: any) => {
      map.set(item.id, item.name ?? `Class ${item.id}`);
    });
    return map;
  }, [classesList.data]);

  const availableSections = useMemo(() => {
    const all = sectionsList.data ?? [];
    if (!selectedClassId) return [];
    const classIdNumber = Number(selectedClassId);
    return all.filter((section: any) => section.class_id === classIdNumber);
  }, [sectionsList.data, selectedClassId]);

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sectionsList.data ?? []).forEach((section: any) => {
      const classLabel =
        classLabelById.get(section.class_id) ?? `Class ${section.class_id}`;
      map.set(section.id, `${classLabel} - ${section.name ?? `Section ${section.id}`}`);
    });
    return map;
  }, [sectionsList.data, classLabelById]);

  const pagedStudents = studentsQuery.data?.data ?? [];
  const totalPages = studentsQuery.data?.total_pages ?? 1;
  const totalItems = studentsQuery.data?.total ?? 0;

  const studentsPagination = {
    page,
    setPage: (p: number) => setPage(p),
    totalPages,
    totalItems,
    pagedItems: pagedStudents,
    pageSize: 20,
    from: totalItems === 0 ? 0 : (page - 1) * 20 + 1,
    to: totalItems === 0 ? 0 : Math.min(page * 20, totalItems),
  };

  const selectedAcademicContext = useMemo(() => {
    if (!sectionIdNumber) {
      return { className: "All Classes", sectionName: "All Sections" };
    }

    const section = (sectionsList.data ?? []).find(
      (item: any) => item.id === sectionIdNumber,
    );
    const className = section?.class_id
      ? classLabelById.get(section.class_id) ?? `Class ${section.class_id}`
      : "Unknown Class";
    const sectionName = section?.name ?? `Section ${sectionIdNumber}`;

    return { className, sectionName };
  }, [sectionIdNumber, sectionsList.data, classLabelById]);

  const previewAcademicGroups = useMemo(() => {
    if (!previewData) return [];
    const grouped = new Map<string, number>();
    previewData.rows.forEach((row) => {
      const className = row.class_name?.trim() || "Unknown Class";
      const sectionName = row.section_name?.trim() || "Unknown Section";
      const key = `${className} / ${sectionName}`;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [previewData]);

  const onClose = () => {
    setIsOpen(false);
    createMutation.reset();
    reset();
  };

  const onOpenImport = () => {
    setIsImportOpen(true);
    setImportFile(null);
    setPreviewData(null);
    setCommitResult(null);
    previewImportMutation.reset();
    commitImportMutation.reset();
  };

  const onCloseImport = () => {
    setIsImportOpen(false);
    setImportFile(null);
    setPreviewData(null);
    setCommitResult(null);
    previewImportMutation.reset();
    commitImportMutation.reset();
  };

  const downloadTemplate = () => {
    const csv = [
      "first_name,last_name,name,parent_phone,parent_name,class_name,section_name,roll_number,date_of_birth,gender,admission_date",
      "Rahul,Sharma,,9876511111,Suresh Sharma,Grade 9,A,101,2012-04-10,male,2024-06-10",
      "Ananya,Verma,,9876522222,Priya Verma,9th,A,102,2012-08-21,female,2024-06-10",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vidyatrack_students_import_template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewImport = async () => {
    if (previewImportMutation.isPending || commitImportMutation.isPending) return;
    if (!importFile) return;
    const data = await previewImportMutation.mutateAsync(importFile);
    setPreviewData(data);
    setCommitResult(null);
  };

  const handleCommitImport = async () => {
    if (commitImportMutation.isPending || previewImportMutation.isPending) return;
    if (!previewData?.import_token) return;
    const result = await commitImportMutation.mutateAsync({
      import_token: previewData.import_token,
      mode: "skip_duplicates",
    });
    setCommitResult(result);
    setToast(
      `Student import completed: ${result.created_rows} created, ${result.duplicate_rows} duplicates, ${result.failed_rows} failed.`,
    );
    onCloseImport();
  };

  const onSubmit = async (values: CreateFormValues) => {
    if (!values.parent_phone.trim()) return;
    if (!values.name.trim() && !values.first_name.trim() && !values.last_name.trim()) {
      return;
    }

    const first = values.first_name.trim();
    const last = values.last_name.trim();
    const fallbackName = values.name.trim();

    const payload: StudentCreateInput = {
      parent_phone: normalizePhoneDigits(values.parent_phone),
      section_id: values.section_id ? Number(values.section_id) : undefined,
      parent_name: values.parent_name.trim() || undefined,
      date_of_birth: values.date_of_birth || undefined,
      gender: values.gender || undefined,
      roll_number: values.roll_number.trim() || undefined,
      admission_date: values.admission_date || undefined,
    };

    if (first || last) {
      payload.first_name = first || undefined;
      payload.last_name = last || undefined;
    } else if (fallbackName) {
      payload.name = fallbackName;
    }

    await createMutation.mutateAsync(payload);
    onClose();
  };

  const isBootLoading =
    studentsQuery.isLoading || classesList.isLoading || sectionsList.isLoading;
  const hasBootError =
    Boolean(studentsQuery.error) ||
    Boolean(classesList.error) ||
    Boolean(sectionsList.error);

  const viewStudent = (student: StudentDto) => {
    navigate(`/management/students/${student.public_id ?? student.id}`, {
      state: { breadcrumbLabel: student.name ?? "Student" },
    });
  };

  return {
    isOpen,
    setIsOpen,
    isImportOpen,
    search,
    setSearch: handleSearchChange,
    sectionId,
    setSectionId: handleSectionChange,
    importFile,
    setImportFile,
    previewData,
    setPreviewData,
    commitResult,
    setCommitResult,
    toast,
    setToast,
    studentsQuery,
    classesList,
    sectionsList,
    createMutation,
    previewImportMutation,
    commitImportMutation,
    register,
    handleSubmit,
    errors,
    selectedClassId,
    classLabelById,
    availableSections,
    sectionLabelById,
    studentsPagination,
    selectedAcademicContext,
    previewAcademicGroups,
    onClose,
    onOpenImport,
    onCloseImport,
    downloadTemplate,
    handlePreviewImport,
    handleCommitImport,
    mapImportError,
    onSubmit,
    isBootLoading,
    hasBootError,
    viewStudent,
  };
}
