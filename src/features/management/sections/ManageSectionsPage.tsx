import { Boxes } from "lucide-react";

import { AcademicSetupShell } from "../setup/AcademicSetupShell";
import { ManageSectionsClassDirectory } from "./components/ManageSectionsClassDirectory";
import { ManageSectionsRegistry } from "./components/ManageSectionsRegistry";
import { ManageSectionsSummary } from "./components/ManageSectionsSummary";
import { useManageSectionsPage } from "./hooks/useManageSectionsPage";

export function ManageSectionsPage() {
  const page = useManageSectionsPage();

  return (
    <AcademicSetupShell
      title="Class Preparation"
      description="Design class and section structure with predictable operational controls."
      icon={Boxes}
    >
      <ManageSectionsSummary
        newClassName={page.newClassName}
        setNewClassName={page.setNewClassName}
        onCreateClass={page.onCreateClass}
        isCreatingClass={page.classes.create.isPending}
        totalClasses={page.classList.length}
        totalSections={page.sectionList.length}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <ManageSectionsClassDirectory
          classList={page.classList}
          sectionList={page.sectionList}
          activeClassId={page.activeClassId}
          onSelectClass={page.setSelectedClassId}
        />

        <ManageSectionsRegistry
          selectedClass={page.selectedClass}
          filteredSections={page.filteredSections}
          sectionsView={page.sectionsView}
          setSectionsView={page.setSectionsView}
          register={page.register}
          handleSubmit={page.handleSubmit}
          onSubmit={page.onSubmit}
          isSubmitting={page.isSubmitting}
        />
      </section>
    </AcademicSetupShell>
  );
}
