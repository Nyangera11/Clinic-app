import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { PatientDashboard } from "./pages/patient-dashboard";
import { HealthWorkerPortal } from "./pages/health-worker-portal";
import { AdminDashboard } from "./pages/admin-dashboard";
import { AppointmentsPage } from "./pages/appointments-page";
import { MedicalRecordsPage } from "./pages/medical-records-page";
import { AboutPage } from "./pages/about-page";
import { ServicesPage } from "./pages/services-page";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "/services",
    Component: ServicesPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/patient-dashboard",
    Component: PatientDashboard,
  },
  {
    path: "/health-worker",
    Component: HealthWorkerPortal,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/appointments",
    Component: AppointmentsPage,
  },
  {
    path: "/medical-records",
    Component: MedicalRecordsPage,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
