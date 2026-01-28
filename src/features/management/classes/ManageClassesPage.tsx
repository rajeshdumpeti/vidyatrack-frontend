import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  BookOpen,
} from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useSubjects } from "@/hooks/useSubjects";

const CLASS_TEMPLATES = [
  "Nursery",
  "LKG",
  "UKG",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E", "F"];

export function ManageClassesPage() {
  const {
    classes: classListData = [],
    createClass: createClassFn,
    isCreating: isClassCreating,
    isLoading: isClassLoading,
  } = useClasses();
  const {
    sections = [],
    createSection,
    isCreating: isSecCreating,
  } = useSections();
  const { subjects = [] } = useSubjects();

  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ name: string }>();

  const onAddClass = (values: { name: string }) => {
    createClassFn(
      { name: values.name },
      {
        onSuccess: () => {
          reset();
          setIsAddClassModalOpen(false);
        },
      },
    );
  };

  if (isClassLoading)
    return (
      <div className="p-10 text-center font-bold">
        Loading School Structure...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              School Structure
            </h1>
            <p className="text-gray-500 font-medium">
              Manage your Grades and Sections
            </p>
          </div>
          <button
            onClick={() => setIsAddClassModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2"
          >
            <Plus size={18} /> Add Class
          </button>
        </header>

        <div className="space-y-4">
          {classListData.map((cls) => (
            <ClassAccordionItem
              key={cls.id}
              cls={cls}
              isExpanded={expandedClassId === cls.id}
              onToggle={() =>
                setExpandedClassId(expandedClassId === cls.id ? null : cls.id)
              }
              sections={sections.filter((s) => s.class_id === cls.id)}
              onCreateSection={(name: string) =>
                createSection({ class_id: cls.id, name })
              }
              isSecCreating={isSecCreating}
            />
          ))}
        </div>
      </div>

      {/* ADD CLASS MODAL WITH DROPDOWN */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Add New Class
            </h2>
            <form onSubmit={handleSubmit(onAddClass)} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Select Grade
                </label>
                <select
                  {...register("name", { required: true })}
                  className="w-full h-14 rounded-2xl bg-gray-50 border-none px-5 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 mt-2"
                >
                  <option value="">-- Choose Class --</option>
                  {CLASS_TEMPLATES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isClassCreating}
                className="w-full bg-blue-600 text-white h-14 rounded-2xl font-black shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {isClassCreating ? "Saving..." : "Establish Class"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassAccordionItem({
  cls,
  isExpanded,
  onToggle,
  sections,
  onCreateSection,
  isSecCreating,
}: any) {
  const [selectedLetter, setSelectedLetter] = useState("");

  const handleAdd = () => {
    if (!selectedLetter) return;
    onCreateSection(selectedLetter);
    setSelectedLetter("");
  };

  return (
    <div
      className={`rounded-[2rem] border bg-white transition-all ${isExpanded ? "border-blue-200" : "border-gray-100"}`}
    >
      <div
        className="p-6 flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            {cls.name[0]}
          </div>
          <h3 className="text-lg font-black text-gray-900">{cls.name}</h3>
        </div>
        <ChevronDown
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>

      {isExpanded && (
        <div className="px-8 pb-8 space-y-6 border-t border-gray-50 pt-6 animate-in slide-in-from-top-2">
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">
              Active Sections
            </h4>
            <div className="flex flex-wrap gap-3">
              {sections.map((s: any) => (
                <div
                  key={s.id}
                  className="bg-gray-100 px-4 py-2 rounded-xl font-black text-gray-700 text-sm"
                >
                  Section {s.name}
                </div>
              ))}

              {/* SECTION DROPDOWN ADDER */}
              <div className="flex gap-2">
                <select
                  value={selectedLetter}
                  onChange={(e) => setSelectedLetter(e.target.value)}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-3 py-1 text-xs font-black outline-none focus:border-blue-500"
                >
                  <option value="">+ Add Section</option>
                  {SECTION_OPTIONS.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      disabled={sections.some((s: any) => s.name === opt)}
                    >
                      Section {opt}
                    </option>
                  ))}
                </select>
                {selectedLetter && (
                  <button
                    onClick={handleAdd}
                    disabled={isSecCreating}
                    className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black"
                  >
                    {isSecCreating ? "..." : "CONFIRM"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
