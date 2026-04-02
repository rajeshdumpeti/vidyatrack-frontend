import { SelectSchoolPage } from "@/features/auth/SelectSchoolPage";
import { SelectRolePage } from "@/features/auth/SelectRolePage";
import { OtpRequestPage } from "@/features/auth/OtpRequestPage";
import { OtpVerifyPage } from "@/features/auth/OtpVerifyPage";
import { PasswordLoginPage } from "@/features/auth/login/PasswordLoginPage";
import { ForgotPasswordPage } from "@/features/auth/forgotPassword/ForgotPasswordPage";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { AuthLayout } from "@/layouts/AuthLayout";

export const authRoutes = {
  path: "/auth",
  element: <AuthLayout />,
  errorElement: <AppErrorBoundary />,
  children: [
    // Password login is the new default login screen
    { path: "login", element: <PasswordLoginPage /> },
    // OTP login kept at /auth/otp-login
    { path: "otp-login", element: <OtpRequestPage /> },
    { path: "verify", element: <OtpVerifyPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> },
    { path: "select-school", element: <SelectSchoolPage /> },
    { path: "select-role", element: <SelectRolePage /> },
  ],
};
