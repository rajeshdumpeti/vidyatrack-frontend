import { TeacherFeatureTopBar } from "@/components/teachers/TeacherFeatureTopBar";

export function EnterMarksHeader() {
  return (
    <>
      <TeacherFeatureTopBar pageLabel="Enter Marks" />
      <h1 className="mb-5 text-2xl font-extrabold text-gray-900 md:mb-8 md:text-3xl">
        Enter Marks
      </h1>
    </>
  );
}
