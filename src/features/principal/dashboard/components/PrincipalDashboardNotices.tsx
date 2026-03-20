import { Activity } from "lucide-react";

type Notice = {
  id: number | string;
  title: string;
  message: string;
};

export function PrincipalDashboardNotices({ notices }: { notices: Notice[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Activity className="h-4 w-4 text-blue-600" />
        System Notices
      </div>
      {notices.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-slate-500">
          No notices right now.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{notice.title}</p>
              <p className="mt-1 text-sm text-slate-600">{notice.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
