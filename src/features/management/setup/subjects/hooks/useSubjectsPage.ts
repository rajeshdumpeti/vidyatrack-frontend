import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listTeachingAssignments } from "@/api/teachingAssignments.api";
import { useCreateSubject, useSubjects } from "@/hooks/useSubjects";
import { useSections } from "@/hooks/useSections";
import { useAuthStore } from "@/store/auth.store";
import type { SectionDto } from "@/types/section.types";
import type { TeachingAssignmentDto } from "@/types/teachingAssignment.types";
import { logger } from "@/utils/logger";

import {
  getSubjectUsage,
  normalizeSubjectSearch,
} from "../helpers/subjects.helpers";

export function useSubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { data, isLoading, error, refetch } = useSubjects();
  const createMutation = useCreateSubject();
  const { schoolId } = useAuthStore();
  const sections = useSections().list;

  const assignmentsQuery = useQuery({
    queryKey: ["teaching-assignments", schoolId, "all-subjects"],
    queryFn: () => listTeachingAssignments(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = normalizeSubjectSearch(search);
    if (!query) return data;
    return data.filter((subject) =>
      normalizeSubjectSearch(subject.name).includes(query),
    );
  }, [data, search]);

  const sectionsById = useMemo(() => {
    const map = new Map<number, SectionDto>();
    (sections.data ?? []).forEach((section) => map.set(section.id, section));
    return map;
  }, [sections.data]);

  const subjectUsage = useMemo(
    () =>
      getSubjectUsage({
        assignments: (assignmentsQuery.data ?? []) as TeachingAssignmentDto[],
        sectionsById,
      }),
    [assignmentsQuery.data, sectionsById],
  );

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setInlineError("Subject name is required.");
      return;
    }
    if (trimmed.length < 2) {
      setInlineError("Enter at least 2 characters.");
      return;
    }

    setInlineError(null);
    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName("");
          logger.info("[subjects] create_success", { trace, name: trimmed });
        },
        onError: (err) => {
          logger.warn("[subjects] create_failed", { trace, err });
          setInlineError("Unable to create subject. Please try again.");
        },
      },
    );
  };

  return {
    filtered,
    isLoading,
    error,
    refetch,
    createMutation,
    search,
    setSearch,
    name,
    setName,
    inlineError,
    clearInlineError: () => setInlineError(null),
    submit,
    subjectUsage,
  };
}
