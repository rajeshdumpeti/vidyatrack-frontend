import { ManageSchoolsCreateForm } from "./components/ManageSchoolsCreateForm";
import { ManageSchoolsHeader } from "./components/ManageSchoolsHeader";
import { ManageSchoolsList } from "./components/ManageSchoolsList";
import { useManageSchoolsPage } from "./hooks/useManageSchoolsPage";

export function ManageSchoolsPage() {
  const page = useManageSchoolsPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <ManageSchoolsHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {page.toast ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            {page.toast}
          </div>
        ) : null}

        <ManageSchoolsCreateForm
          register={page.register}
          handleSubmit={page.handleSubmit}
          errors={page.formState.errors}
          isSubmitting={page.formState.isSubmitting}
          isPending={page.create.isPending}
          isError={page.create.isError}
          onSubmit={page.onSubmit}
        />

        <ManageSchoolsList schools={page.list.data?.data ?? []} />
      </main>
    </div>
  );
}
