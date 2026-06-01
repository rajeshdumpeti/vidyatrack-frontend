import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type AcademicSetupShellProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

const modules = [
  { label: "Sections", to: "/management/setup/sections" },
  { label: "Grade Subjects", to: "/management/setup/subjects" },
  { label: "Assignment Management", to: "/management/setup/assign-subjects" },
  { label: "Fee Plans", to: "/management/setup/fee-structure" },
];

export function AcademicSetupShell({
  title,
  description,
  icon: Icon,
  children,
}: AcademicSetupShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Academic Setup
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  {title}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {modules.map((module) => {
              const active = location.pathname === module.to;
              return (
                <Link
                  key={module.to}
                  to={module.to}
                  className={[
                    "rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {module.label}
                </Link>
              );
            })}
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}
