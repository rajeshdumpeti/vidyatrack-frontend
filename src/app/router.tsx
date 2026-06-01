import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { authRoutes } from "./routes/auth.routes";
import { managementRoutes } from "./routes/management.routes";
import { platformRoutes } from "./routes/platform.routes";
import { principalRoutes } from "./routes/principal.routes";
import { teacherRoutes } from "./routes/teacher.routes";
import { superadminRoutes } from "./routes/superadmin.routes";

export const router = createBrowserRouter([
  {
    errorElement: <AppErrorBoundary />,
    children: [
      { path: "/", element: <Navigate to="/auth/login" replace /> },
      // PRD-friendly aliases
      { path: "/login", element: <Navigate to="/auth/login" replace /> },
      { path: "/forgot-password", element: <Navigate to="/auth/forgot-password" replace /> },
      authRoutes,
      superadminRoutes,
      platformRoutes,
      teacherRoutes,
      principalRoutes,
      managementRoutes,
      { path: "*", element: <div>404</div> },
    ],
  },
]);
