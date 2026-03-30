import { Sparkles } from "lucide-react";

type InsightStateProps = {
  title: string;
  description?: string;
};

export function InsightState({ title, description }: InsightStateProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-teal-50 px-6 py-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-2xl text-sm font-medium text-slate-600">
        {description}
      </p>
    </div>
  );
}
