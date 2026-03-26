import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useClasses } from "@/hooks/useClasses";
import { useCreateManagementTeacher } from "@/hooks/useCreateManagementTeacher";
import { useSections } from "@/hooks/useSections";
import { useTeachers, useUpdateTeacherStatus } from "@/hooks/useTeachers";
import type { CreateTeacherInput, TeacherStatus } from "@/types/teacher.types";
import type { SectionDto } from "@/types/section.types";
import { digitsOnly } from "@/utils/phone";
import { logger } from "@/utils/logger";

import type { TeachersSetupFormValues } from "../types/teachersSetup.types";

export function useTeachersSetupPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const teachersQuery = useTeachers();
  const { isLoading } = teachersQuery;
  const classesQuery = useClasses();
  const sectionsQuery = useSections();
  const createMutation = useCreateManagementTeacher();
  const updateStatusMutation = useUpdateTeacherStatus();
  const [updatingTeacherId, setUpdatingTeacherId] = useState<number | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<TeachersSetupFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      class_id: "",
      section_id: "",
    },
    mode: "onBlur",
  });

  const watchedClassId = useWatch({
    control,
    name: "class_id",
  });

  const availableSections = useMemo(() => {
    if (!watchedClassId || !sectionsQuery.list.data) return [];
    return sectionsQuery.list.data.filter(
      (section: SectionDto) => section.class_id === Number(watchedClassId),
    );
  }, [watchedClassId, sectionsQuery.list.data]);

  useEffect(() => {
    setValue("section_id", "");
  }, [watchedClassId, setValue]);

  const clearForm = () => {
    setSuccessMsg(null);
    setInlineError(null);
    reset({ name: "", phone: "", email: "", class_id: "", section_id: "" });
  };

  const onStatusChange = (teacherId: number, status: TeacherStatus) => {
    setUpdatingTeacherId(teacherId);
    updateStatusMutation.mutate(
      { teacherId, status },
      {
        onSettled: () => setUpdatingTeacherId(null),
      },
    );
  };

  const onSubmit = (values: TeachersSetupFormValues) => {
    if (!values.section_id) {
      setInlineError("Please select a section.");
      return;
    }

    const payload: CreateTeacherInput = {
      name: values.name.trim(),
      phone: digitsOnly(values.phone),
      email: values.email?.trim() || undefined,
      section_id: Number(values.section_id),
    };

    setInlineError(null);
    setSuccessMsg(null);

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg("Teacher created successfully.");
        clearForm();
        logger.info("[mgmt][teachers] create success", { trace });
      },
      onError: () => {
        setInlineError("Unable to create teacher. Please try again.");
      },
    });
  };

  return {
    isLoading,
    teachers: teachersQuery.data,
    classesQuery,
    createMutation,
    successMsg,
    inlineError,
    register,
    handleSubmit,
    isSubmitting,
    watchedClassId,
    availableSections,
    clearForm,
    onSubmit,
    onStatusChange,
    isUpdatingStatus: updateStatusMutation.isPending,
    updatingTeacherId,
  };
}
