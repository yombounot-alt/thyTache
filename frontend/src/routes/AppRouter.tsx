import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"

import { AuthLayout } from "@/layouts/AuthLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AdminRoute } from "@/routes/AdminRoute"
import { PageLoader } from "@/components/shared/PageLoader"

const SplashScreen = lazy(() => import("@/pages/auth/SplashScreen"))
const LandingPage = lazy(() => import("@/pages/auth/LandingPage"))
const Login = lazy(() => import("@/pages/auth/Login"))
const Register = lazy(() => import("@/pages/auth/Register"))
const VerifyOtp = lazy(() => import("@/pages/auth/VerifyOtp"))
const AccountVerified = lazy(() => import("@/pages/auth/AccountVerified"))
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"))
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"))
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"))
const ResetSuccess = lazy(() => import("@/pages/auth/ResetSuccess"))

const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome"))
const TaskListPage = lazy(() => import("@/pages/tasks/TaskListPage"))
const TaskKanbanPage = lazy(() => import("@/pages/tasks/TaskKanbanPage"))
const TaskCalendarPage = lazy(() => import("@/pages/tasks/TaskCalendarPage"))
const TaskCardsPage = lazy(() => import("@/pages/tasks/TaskCardsPage"))
const TaskTrashPage = lazy(() => import("@/pages/tasks/TaskTrashPage"))
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"))
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"))

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"))
const AdminRoles = lazy(() => import("@/pages/admin/AdminRoles"))
const AdminTasks = lazy(() => import("@/pages/admin/AdminTasks"))
const AdminStatistics = lazy(() => import("@/pages/admin/AdminStatistics"))

const EmailsPreviewGallery = lazy(() => import("@/pages/emails/EmailsPreviewGallery"))

const NotFound404 = lazy(() => import("@/pages/errors/NotFound404"))
const Forbidden403 = lazy(() => import("@/pages/errors/Forbidden403"))
const ServerError500 = lazy(() => import("@/pages/errors/ServerError500"))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<SplashScreen />) },
  { path: "/accueil", element: withSuspense(<LandingPage />) },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: withSuspense(<Login />) },
      { path: "/register", element: withSuspense(<Register />) },
      { path: "/verify-otp", element: withSuspense(<VerifyOtp />) },
      { path: "/account-verified", element: withSuspense(<AccountVerified />) },
      { path: "/forgot-password", element: withSuspense(<ForgotPassword />) },
      { path: "/verify-email", element: withSuspense(<VerifyEmail />) },
      { path: "/reset-password", element: withSuspense(<ResetPassword />) },
      { path: "/reset-success", element: withSuspense(<ResetSuccess />) },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: withSuspense(<DashboardHome />) },
          { path: "/tasks", element: withSuspense(<TaskListPage />) },
          { path: "/tasks/kanban", element: withSuspense(<TaskKanbanPage />) },
          { path: "/tasks/calendar", element: withSuspense(<TaskCalendarPage />) },
          { path: "/tasks/cards", element: withSuspense(<TaskCardsPage />) },
          { path: "/tasks/trash", element: withSuspense(<TaskTrashPage />) },
          { path: "/profile", element: withSuspense(<ProfilePage />) },
          { path: "/notifications", element: withSuspense(<NotificationsPage />) },
          { path: "/emails-preview", element: withSuspense(<EmailsPreviewGallery />) },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin", element: withSuspense(<AdminDashboard />) },
              { path: "/admin/users", element: withSuspense(<AdminUsers />) },
              { path: "/admin/roles", element: withSuspense(<AdminRoles />) },
              { path: "/admin/tasks", element: withSuspense(<AdminTasks />) },
              { path: "/admin/statistics", element: withSuspense(<AdminStatistics />) },
            ],
          },
        ],
      },
    ],
  },

  { path: "/403", element: withSuspense(<Forbidden403 />) },
  { path: "/500", element: withSuspense(<ServerError500 />) },
  { path: "*", element: withSuspense(<NotFound404 />) },
])
