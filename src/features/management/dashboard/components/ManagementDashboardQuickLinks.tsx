import { ClipboardCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type StepItem = {
  title: string;
  desc: string;
  link: string;
  icon: LucideIcon;
  iconClassName: string;
  color: string;
};

export function ManagementDashboardQuickLinks({
  heroImageUrl,
  steps,
  welcomeMessage,
  announcementText,
  supportContactText,
}: {
  heroImageUrl?: string;
  steps: StepItem[];
  welcomeMessage: string;
  announcementText: string;
  supportContactText: string;
}) {
  return (
    <>
      {heroImageUrl ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <img
            src={heroImageUrl}
            alt="Management dashboard banner"
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <Link
            key={step.title}
            to={step.link}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className={`${step.color} mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110`}
            >
              <step.icon className={step.iconClassName} />
            </div>
            <h3 className="mb-2 font-bold text-gray-900">{step.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between gap-4 rounded-2xl bg-blue-600 p-6 text-white">
        <div>
          <h2 className="text-lg font-bold">{welcomeMessage}</h2>
          <p className="text-sm text-blue-100">{announcementText}</p>
          <p className="mt-2 text-xs text-blue-200">{supportContactText}</p>
        </div>
        <ClipboardCheck className="h-12 w-12 shrink-0 text-blue-400 opacity-50" />
      </div>
    </>
  );
}
