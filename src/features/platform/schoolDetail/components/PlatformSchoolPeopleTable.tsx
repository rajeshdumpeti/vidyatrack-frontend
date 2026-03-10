import { Mail, Phone, ShieldCheck, UserCircle2, Users } from "lucide-react";

import type {
  PlatformSchoolDetailTabKey,
  PlatformSchoolPersonRow,
} from "../types/platformSchoolDetail.types";
import { PLATFORM_SCHOOL_DETAIL_TABS } from "../constants/platformSchoolDetail.constants";

type PlatformSchoolPeopleTableProps = {
  activeTab: PlatformSchoolDetailTabKey;
  setActiveTab: (tab: PlatformSchoolDetailTabKey) => void;
  search: string;
  setSearch: (value: string) => void;
  rows: PlatformSchoolPersonRow[];
};

export function PlatformSchoolPeopleTable({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  rows,
}: PlatformSchoolPeopleTableProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {PLATFORM_SCHOOL_DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== "overview" ? (
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
          />
        ) : null}
      </div>

      {activeTab !== "overview" ? (
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Role</th>
                <th className="px-2 py-3">Contact</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Context</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${activeTab}-${row.id}`} className="border-b border-gray-50">
                  <td className="px-2 py-3 font-semibold text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-2 py-3 text-gray-700">{row.role ?? "-"}</td>
                  <td className="px-2 py-3 text-gray-700">
                    <div>
                      {row.email !== "-" ? (
                        <a
                          href={`mailto:${row.email}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {row.email}
                        </a>
                      ) : (
                        <span>{row.email}</span>
                      )}
                    </div>
                    <div className="text-xs">
                      {row.phone !== "-" ? (
                        <a
                          href={`tel:${row.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {row.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">{row.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                        row.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.status === "active" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-gray-600">{row.extra ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <UserCircle2 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              No matching records found.
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
