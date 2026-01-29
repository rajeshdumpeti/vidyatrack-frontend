import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  HiOutlineViewGridAdd,
  HiOutlineCollection,
  HiOutlineHashtag,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";

import { useAuthStore } from "@/store/auth.store";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { logger } from "@/utils/logger";

type FormValues = {
  class_id: string;
  name: string;
};

export function ManageSectionsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  // These hooks now use schoolId internally for isolation
  // Add this near your other state declarations
  const [newClassName, setNewClassName] = useState("");
  const classes = useClasses(); // Ensure you have access to the classes hook
  const sections = useSections();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { class_id: "", name: "" },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedClassId(null);
  }, [schoolId]);

  // Filter sections based on the selected class in the UI
  const filteredSections = useMemo(() => {
    return (sections.list.data ?? []).filter(
      (s: any) => s.class_id === selectedClassId,
    );
  }, [sections.list.data, selectedClassId]);

  // Reset selection when switching schools to prevent cross-school data leaks

  const onSubmit = (values: FormValues) => {
    // Use selectedClassId from state since that's what the user clicked in the sidebar
    if (!selectedClassId || !schoolId) {
      logger.error("Missing selection", { selectedClassId, schoolId });
      return;
    }

    sections.create.mutate(
      {
        class_id: selectedClassId,
        name: values.name.trim(),
        school_id: schoolId,
      },
      {
        onSuccess: () => {
          reset({ class_id: values.class_id, name: "" });
          logger.info("[management][sections] create_success", { trace });
        },
      },
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header with Title & Subtitle */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <HiOutlineViewGridAdd size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e293b]">
            Academic Setup
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your school's classes and sections.
          </p>
        </div>
      </div>

      {/* Quick Add Class Bar - Refined per Screenshot */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Quick Add: New Class/Grade
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <HiOutlineAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Grade 11"
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => {
              if (!newClassName.trim() || !schoolId) return;
              classes.create.mutate(
                { name: newClassName.trim(), school_id: schoolId },
                { onSuccess: () => setNewClassName("") },
              );
            }}
            disabled={classes.create.isPending}
            className="h-14 px-10 bg-[#0f172a] hover:bg-black text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {classes.create.isPending ? "Creating..." : "Create Class"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">
        {/* Left: Class Selection Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Class
              </span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">
                {classes.list.data?.length || 0} TOTAL
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-3 space-y-2">
              {classes.list.data?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    selectedClassId === c.id
                      ? "bg-blue-50 ring-1 ring-blue-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        selectedClassId === c.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <HiOutlineCollection size={20} />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold ${selectedClassId === c.id ? "text-blue-900" : "text-slate-700"}`}
                      >
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        3 Sections • 120 Students
                      </p>
                    </div>
                  </div>
                  <HiOutlineChevronRight
                    className={
                      selectedClassId === c.id
                        ? "text-blue-400"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Section Panel */}
        <div className="col-span-12 lg:col-span-8">
          {selectedClassId ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Add Section to{" "}
                  {
                    classes.list.data?.find((c) => c.id === selectedClassId)
                      ?.name
                  }
                </h3>
                <HiOutlineCog className="text-slate-300 cursor-pointer hover:text-slate-500" />
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex items-center gap-4"
              >
                <div className="relative flex-1">
                  <HiOutlineHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  <input
                    {...register("name", { required: true })}
                    placeholder="e.g. Section Blue"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                >
                  <HiOutlinePlus /> Add Section
                </button>
              </form>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  Current Sections{" "}
                  <span className="bg-slate-100 px-2 rounded">
                    {filteredSections.length} TOTAL
                  </span>
                </div>

                {filteredSections.length > 0 ? (
                  filteredSections.map((s: any) => (
                    <div
                      key={s.id}
                      className="group p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        <span className="font-bold text-slate-700">
                          {s.name}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        40 Students
                      </span>
                    </div>
                  ))
                ) : (
                  /* Industrial Empty State for No Sections */
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                      <HiOutlineHashtag size={24} />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      No sections created for this class yet.
                    </p>
                    <p className="text-[10px] text-slate-300">
                      Use the form above to add your first section (e.g., A, B,
                      or Blue).
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-200 mb-6">
                <HiOutlineCollection size={40} />
              </div>
              <p className="text-slate-400 font-semibold max-w-[200px]">
                Select a class from the left to manage details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
