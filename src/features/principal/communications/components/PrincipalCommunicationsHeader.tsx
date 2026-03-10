import { TeacherFeatureTopBar } from "@/components/teachers/TeacherFeatureTopBar";
import { TEACHER_COMMUNICATION_TABS } from "@/features/teachers/communications/constants/teacherCommunications.constants";

import type { PrincipalCommunicationsTabKey } from "../types/principalCommunications.types";

type PrincipalCommunicationsHeaderProps = {
  activeTab: PrincipalCommunicationsTabKey;
  onTabChange: (tab: PrincipalCommunicationsTabKey) => void;
};

export function PrincipalCommunicationsHeader({
  activeTab,
  onTabChange,
}: PrincipalCommunicationsHeaderProps) {
  return (
    <>
      <TeacherFeatureTopBar
        pageLabel="Teacher Communications"
        backLabel="Back"
      />

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Academic Hub
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
              Keep families and students aligned
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Send homework, message parents, and log private student notes for
              your assigned classes.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
            {TEACHER_COMMUNICATION_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  onTabChange(tab.key as PrincipalCommunicationsTabKey)
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
