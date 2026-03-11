import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useSchools } from "@/hooks/useSchools";
import { logger } from "@/utils/logger";

import type { ManageSchoolsFormValues } from "../types/manageSchools.types";

export function useManageSchoolsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [toast, setToast] = useState<string | null>(null);
  const { list, create } = useSchools();

  const form = useForm<ManageSchoolsFormValues>({
    defaultValues: { name: "", admin_phone: "", admin_email: "" },
    mode: "onBlur",
  });

  const onSubmit = (values: ManageSchoolsFormValues) => {
    setToast(null);

    create.mutate(
      {
        name: values.name.trim(),
        admin_phone: values.admin_phone.trim(),
        admin_email: values.admin_email.trim() || null,
      },
      {
        onSuccess: () => {
          setToast("School created successfully.");
          form.reset({ name: "", admin_phone: "", admin_email: "" });
          logger.info("[management][schools] create_success", { trace });
        },
        onError: (err) => {
          logger.error("[management][schools] create_failed", { trace, err });
        },
      },
    );
  };

  return {
    toast,
    list,
    create,
    onSubmit,
    ...form,
  };
}
