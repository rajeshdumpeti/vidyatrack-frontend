import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { authRoutes } from "./routes/auth.routes";
import { managementRoutes } from "./routes/management.routes";
import { platformRoutes } from "./routes/platform.routes";
import { principalRoutes } from "./routes/principal.routes";
import { teacherRoutes } from "./routes/teacher.routes";

export const router = createBrowserRouter([
  {
    errorElement: <AppErrorBoundary />,
    children: [
      { path: "/", element: <Navigate to="/auth/login" replace /> },
      authRoutes,
      platformRoutes,
      teacherRoutes,
      principalRoutes,
      managementRoutes,
      { path: "*", element: <div>404</div> },
    ],
  },
]);
