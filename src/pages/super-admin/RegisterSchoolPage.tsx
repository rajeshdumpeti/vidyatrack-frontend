import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Building2,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { logger } from "@/utils/logger";

// Schema based on openapi.json: SchoolCreate
type SchoolCreate = {
  name: string;
};

export default function RegisterSchoolPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const queryClient = useQueryClient();
  const [successData, setSuccessData] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolCreate>();

  // Mutation to call POST /api/v1/schools
  const mutation = useMutation({
    mutationFn: async (data: SchoolCreate) => {
      const response = await fetch("/api/v1/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Standard bearer auth
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create school");
      return response.json();
    },
    onSuccess: (data) => {
      setSuccessData(data);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      logger.info("[super-admin] school_created", { trace, schoolId: data.id });
    },
    onError: (err) => {
      logger.error("[super-admin] creation_failed", { trace, err });
    },
  });

  const onSubmit = (values: SchoolCreate) => {
    mutation.mutate(values);
  };

  const handleReset = () => {
    setSuccessData(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-12 border border-white">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-200">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Vidyatrack Control
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            Provision New Tenant
          </p>
        </div>

        {!successData ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                Official School Name
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                <input
                  {...register("name", { required: "School name is required" })}
                  className="w-full h-16 pl-14 pr-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none ring-2 ring-transparent focus:ring-blue-600 transition-all placeholder:text-gray-300"
                  placeholder="e.g. Heritage International School"
                />
              </div>
              {errors.name && (
                <p className="text-xs font-bold text-red-500 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-16 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Establish Tenant <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Provisioning Successful
            </h2>
            <p className="text-gray-500 font-medium mt-2">
              School{" "}
              <span className="text-blue-600 font-black">
                {successData.name}
              </span>{" "}
              is now live.
            </p>
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-[10px] font-black uppercase text-gray-400">
                System ID
              </span>
              <p className="text-lg font-mono font-black text-gray-700">
                {successData.id}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="mt-10 text-sm font-black text-blue-600 hover:text-blue-800 underline underline-offset-8"
            >
              Register Another School
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
