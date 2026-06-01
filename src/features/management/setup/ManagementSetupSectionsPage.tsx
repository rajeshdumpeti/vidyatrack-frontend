import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers3, Trash2 } from "lucide-react";

import { createManagementSection, deleteManagementSection, listManagementSections } from "@/api/managementSetup.api";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { useAuthStore } from "@/store/auth.store";

import { AcademicSetupShell } from "./AcademicSetupShell";

export function ManagementSetupSectionsPage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [roomNumber, setRoomNumber] = useState("");

  const setupQuery = useQuery({
    queryKey: ["management-sections", schoolId],
    queryFn: () => listManagementSections(schoolId!),
    enabled: Boolean(schoolId),
  });
  const academicQuery = useQuery({
    queryKey: ["management-classes", schoolId],
    queryFn: () => getAcademicSetup(schoolId!),
    enabled: Boolean(schoolId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createManagementSection(schoolId!, {
        class_id: selectedClassId!,
        name: name.trim(),
        capacity: Number(capacity || 40),
        room_number: roomNumber.trim() || null,
      }),
    onSuccess: async () => {
      setName("");
      setCapacity("40");
      setRoomNumber("");
      await queryClient.invalidateQueries({ queryKey: ["management-sections", schoolId] });
      await queryClient.invalidateQueries({ queryKey: ["management-setup-status", schoolId] });
      await queryClient.invalidateQueries({ queryKey: ["academic-setup", schoolId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sectionId: number) => deleteManagementSection(schoolId!, sectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["management-sections", schoolId] });
      await queryClient.invalidateQueries({ queryKey: ["management-setup-status", schoolId] });
      await queryClient.invalidateQueries({ queryKey: ["academic-setup", schoolId] });
    },
  });

  const classes = academicQuery.data?.classes ?? [];
  const selectedGroup = useMemo(
    () =>
      (setupQuery.data ?? []).find((group) => group.class_id === selectedClassId) ??
      ((setupQuery.data ?? [])[0] ?? null),
    [selectedClassId, setupQuery.data],
  );

  return (
    <AcademicSetupShell
      title="Sections"
      description="Create sections per grade with room and capacity details."
      icon={Layers3}
    >
      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Create section</h2>
          <div className="mt-4 space-y-3">
            <select
              value={selectedClassId ?? ""}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select grade</option>
              {classes.map((classRow) => (
                <option key={classRow.id} value={classRow.id}>
                  {classRow.name}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Section name, e.g. A"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Capacity"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Room number"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!selectedClassId || name.trim().length === 0 || createMutation.isPending}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Create section"}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(setupQuery.data ?? []).map((group) => (
              <button
                key={group.class_id}
                type="button"
                onClick={() => setSelectedClassId(group.class_id)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-bold",
                  selectedGroup?.class_id === group.class_id
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {group.class_name} ({group.sections.length})
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {selectedGroup?.sections.length ? (
              selectedGroup.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedGroup.class_name} - {section.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Capacity {section.capacity}{section.room_number ? ` | Room ${section.room_number}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(section.id)}
                    className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No active sections yet for this grade.
              </div>
            )}
          </div>
        </article>
      </section>
    </AcademicSetupShell>
  );
}
