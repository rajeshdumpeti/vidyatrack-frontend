import { BookOpen, Users } from "lucide-react";

type PrincipalCommunicationsContextCardProps = {
  selectedClassId: number | "";
  setSelectedClassId: (value: number | "") => void;
  selectedSectionId: number | "";
  setSelectedSectionId: (value: number | "") => void;
  selectedSubjectId: number | "";
  setSelectedSubjectId: (value: number | "") => void;
  classes: Array<{ id: number; name: string }>;
  filteredSections: Array<{ id: number; name: string }>;
  subjects: Array<{ id: number; name: string }>;
  studentsCount: number;
};

export function PrincipalCommunicationsContextCard({
  selectedClassId,
  setSelectedClassId,
  selectedSectionId,
  setSelectedSectionId,
  selectedSubjectId,
  setSelectedSubjectId,
  classes,
  filteredSections,
  subjects,
  studentsCount,
}: PrincipalCommunicationsContextCardProps) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-900">
            Class & Subject
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <select
                value={selectedClassId}
                onChange={(event) =>
                  setSelectedClassId(Number(event.target.value) || "")
                }
                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
              >
                {classes.length === 0 ? (
                  <option value="">No classes</option>
                ) : (
                  classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <select
                value={selectedSectionId}
                onChange={(event) =>
                  setSelectedSectionId(Number(event.target.value) || "")
                }
                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
              >
                {filteredSections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <select
                value={selectedSubjectId}
                onChange={(event) =>
                  setSelectedSubjectId(Number(event.target.value) || "")
                }
                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects</option>
                ) : (
                  subjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Messages and homework are sent to the selected class & subject.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Students
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              {studentsCount} enrolled
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Only students in this section are available.
          </p>
        </div>
      </div>
    </div>
  );
}
