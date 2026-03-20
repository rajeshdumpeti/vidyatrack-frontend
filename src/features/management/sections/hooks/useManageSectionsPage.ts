import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useAuthStore } from "@/store/auth.store";
import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";
import { logger } from "@/utils/logger";

import type {
  ManageSectionsFormValues,
  ManageSectionsViewMode,
} from "../types/manageSections.types";

export function useManageSectionsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [sectionsView, setSectionsView] =
    useState<ManageSectionsViewMode>("chips");
  const [newClassName, setNewClassName] = useState("");
  const classes = useClasses();
  const sections = useSections();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ManageSectionsFormValues>({
    defaultValues: { class_id: "", name: "" },
  });

  const classList = useMemo(
    () => (classes.list.data ?? []) as ClassDto[],
    [classes.list.data],
  );
  const sectionList = useMemo(
    () => (sections.list.data ?? []) as SectionDto[],
    [sections.list.data],
  );
  const activeClassId = useMemo(() => {
    if (
      selectedClassId &&
      classList.some((classItem) => classItem.id === selectedClassId)
    ) {
      return selectedClassId;
    }
    return null;
  }, [classList, selectedClassId]);

  const filteredSections = useMemo(
    () => sectionList.filter((section) => section.class_id === activeClassId),
    [activeClassId, sectionList],
  );

  const selectedClass = useMemo(
    () => classList.find((classItem) => classItem.id === activeClassId) ?? null,
    [activeClassId, classList],
  );

  const onCreateClass = () => {
    if (!newClassName.trim() || !schoolId) return;
    classes.create.mutate(
      { name: newClassName.trim(), school_id: schoolId },
      { onSuccess: () => setNewClassName("") },
    );
  };

  const onSubmit = (values: ManageSectionsFormValues) => {
    if (!activeClassId || !schoolId) {
      logger.error("[academic][sections] missing_context", {
        trace,
        selectedClassId: activeClassId,
        schoolId,
      });
      return;
    }

    sections.create.mutate(
      {
        class_id: activeClassId,
        name: values.name.trim(),
        school_id: schoolId,
      },
      {
        onSuccess: () => {
          reset({ class_id: values.class_id, name: "" });
          logger.info("[academic][sections] create_success", { trace });
        },
      },
    );
  };

  return {
    newClassName,
    setNewClassName,
    selectedClassId,
    setSelectedClassId,
    sectionsView,
    setSectionsView,
    classes,
    sections,
    register,
    handleSubmit,
    isSubmitting,
    classList,
    sectionList,
    activeClassId,
    filteredSections,
    selectedClass,
    onCreateClass,
    onSubmit,
  };
}
