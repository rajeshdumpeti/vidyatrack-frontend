import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { PrincipalLayout } from "../layouts/PrincipalLayout";
import { ManagementLayout } from "../layouts/ManagementLayout";
import { OtpRequestPage } from "../features/auth/OtpRequestPage";
import { OtpVerifyPage } from "../features/auth/OtpVerifyPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth/login" replace /> },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <OtpRequestPage />,
      },
      { path: "verify", element: <OtpVerifyPage /> },
    ],
  },

  {
    path: "/teacher",
    element: <TeacherLayout />,
    children: [{ index: true, element: <div>Teacher Dashboard (UI TBD)</div> }],
  },

  {
    path: "/principal",
    element: <PrincipalLayout />,
    children: [{ index: true, element: <div>Principal Home (UI TBD)</div> }],
  },

  {
    path: "/management",
    element: <ManagementLayout />,
    children: [{ index: true, element: <div>Management Home (UI TBD)</div> }],
  },

  { path: "*", element: <div>404</div> },
]);
