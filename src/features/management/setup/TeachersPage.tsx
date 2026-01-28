import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Search,
  Mail,
  Phone,
  MoreVertical,
  Plus,
  X,
  Loader2,
} from "lucide-react";

import { useTeachers } from "@/hooks/useTeachers";
import { useSections } from "@/hooks/useSections";
import { useCreateManagementTeacher } from "@/hooks/useCreateManagementTeacher";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { digitsOnly } from "@/utils/phone";
import { normalize, matchesSearch } from "@/utils/search";
import { getInitials } from "@/utils/formatters";

import type { CreateTeacherInput } from "@/types/teacher.types";

export function TeachersPage() {
  const { data: teachers = [], isLoading, error } = useTeachers();
  const { sections = [] } = useSections();
  const createMutation = useCreateManagementTeacher();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return teachers;
    return teachers.filter((t) => matchesSearch(t, q));
  }, [teachers, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeacherInput>();

  const onSubmit = (payload: CreateTeacherInput) => {
    createMutation.mutate(
      { ...payload, phone: digitsOnly(payload.phone) },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSuccessMsg("Teacher onboarded successfully");
          reset();
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  if (isLoading) return <LoadingState />;
  if (error)
    return <ErrorState title="Error" message="Could not load teachers" />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 sm:p-8">
      {/* HEADER SECTION */}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">Teacher List</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#4477FF] hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Add New Teacher
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white rounded-[2rem] p-4 mb-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-[#F3F6F9] border-none rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <FilterSelect label="All Departments" />
            <FilterSelect label="All Status" />
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="hidden md:grid grid-cols-12 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <div className="col-span-3">Teacher</div>
          <div className="col-span-1 text-center">ID</div>
          <div className="col-span-2">Subject</div>
          <div className="col-span-2">Class</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* TEACHER ROWS */}
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-4 md:px-8 md:py-5 border border-gray-50 shadow-sm hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-12 items-center gap-4"
            >
              {/* Teacher Info */}
              <div className="col-span-3 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(t.name)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-gray-900 truncate">{t.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Joined 2024
                  </p>
                </div>
              </div>

              {/* ID */}
              <div className="col-span-1 text-center text-sm font-bold text-gray-400">
                #{t.id}
              </div>

              {/* Subject */}
              <div className="col-span-2 text-sm font-bold text-gray-700">
                Mathematics
              </div>

              {/* Class Badge */}
              <div className="col-span-2">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                  {t.assigned_section_label || "All Grades"}
                </span>
              </div>

              {/* Contact Icons */}
              <div className="col-span-2 flex gap-3 text-gray-400">
                <Mail
                  size={18}
                  className="hover:text-blue-500 cursor-pointer transition-colors"
                />
                <Phone
                  size={18}
                  className="hover:text-blue-500 cursor-pointer transition-colors"
                />
              </div>

              {/* Status Badge */}
              <div className="col-span-1 flex justify-center">
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-green-100">
                  Active
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 text-right">
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">
                Add New Teacher
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Full Name
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full mt-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Phone Number
                </label>
                <input
                  {...register("phone", { required: true })}
                  className="w-full mt-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="10-digit number"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Section Assignment
                </label>
                <select
                  {...register("section_id", { required: true })}
                  className="w-full mt-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.class_name} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-[#4477FF] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 mt-4 disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "Complete Onboarding"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Filter Select for the Search Bar
function FilterSelect({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
        {label}
      </span>
      <MoreVertical size={14} className="rotate-90 text-gray-400" />
    </div>
  );
}
