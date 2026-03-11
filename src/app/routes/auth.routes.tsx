import { SelectSchoolPage } from "@/features/auth/SelectSchoolPage";
import { OtpRequestPage } from "@/features/auth/OtpRequestPage";
import { OtpVerifyPage } from "@/features/auth/OtpVerifyPage";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { AuthLayout } from "@/layouts/AuthLayout";

export const authRoutes = {
  path: "/auth",
  element: <AuthLayout />,
  errorElement: <AppErrorBoundary />,
  children: [
    { path: "login", element: <OtpRequestPage /> },
    { path: "verify", element: <OtpVerifyPage /> },
    { path: "select-school", element: <SelectSchoolPage /> },
  ],
};
