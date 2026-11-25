import { BookOpen, Database, FlaskConical, Server, FileText, GraduationCap, LayoutGrid, LineChart, MessageSquare, Settings, Shield, Stethoscope, Target, Users } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout, type NavGroup } from './components/DashboardLayout';
import { AuthProvider, RequireRole } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';

const Patient = {
  Overview: lazy(() => import('./pages/patient/PatientPages').then((m) => ({ default: m.PatientOverview }))),
  Assistant: lazy(() => import('./pages/patient/PatientPages').then((m) => ({ default: m.PatientAssistant }))),
  Learning: lazy(() => import('./pages/patient/PatientPages').then((m) => ({ default: m.PatientLearning }))),
  Career: lazy(() => import('./pages/patient/PatientPages').then((m) => ({ default: m.PatientCareer }))),
};
const Pro = {
  Overview: lazy(() => import('./pages/pro/ProPages').then((m) => ({ default: m.ProOverview }))),
  Queue: lazy(() => import('./pages/pro/ProPages').then((m) => ({ default: m.ProQueue }))),
  Patients: lazy(() => import('./pages/pro/ProPages').then((m) => ({ default: m.ProPatients }))),
  Research: lazy(() => import('./pages/pro/ProPages').then((m) => ({ default: m.ProResearch }))),
  Students: lazy(() => import('./pages/pro/ProPages').then((m) => ({ default: m.ProStudents }))),
  LabReview: lazy(() => import('./pages/pro/LabReview').then((m) => ({ default: m.ProLabReview }))),
};
const Admin = {
  Overview: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminOverview }))),
  Users: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminUsers }))),
  Analytics: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminAnalytics }))),
  Diagnostics: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminDiagnostics }))),
  Content: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminContent }))),
  Settings: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminSettings }))),
  Health: lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminHealth }))),
};

const patientNav: NavGroup[] = [
  { heading: 'My portal', items: [{ to: '/patient', label: 'Overview', icon: LayoutGrid, end: true }, { to: '/patient/assistant', label: 'Aether AI', icon: MessageSquare }] },
  { heading: 'Education & growth', items: [{ to: '/patient/learning', label: 'Learning Hub', icon: BookOpen }, { to: '/patient/career', label: 'Career Match', icon: Target }] },
];
const proNav: NavGroup[] = [
  { heading: 'Clinical', items: [{ to: '/pro', label: 'Overview', icon: LayoutGrid, end: true }, { to: '/pro/queue', label: 'AI queue', icon: Stethoscope }, { to: '/pro/lab-review', label: 'Lab review', icon: FlaskConical }, { to: '/pro/patients', label: 'Patients', icon: Users }] },
  { heading: 'Research & teaching', items: [{ to: '/pro/research', label: 'Research hub', icon: Database }, { to: '/pro/students', label: 'Mentorship', icon: GraduationCap }] },
];
const adminNav: NavGroup[] = [
  { heading: 'Platform', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true }, { to: '/admin/users', label: 'Users', icon: Users }, { to: '/admin/analytics', label: 'Analytics', icon: LineChart }] },
  { heading: 'Operations', items: [{ to: '/admin/diagnostics', label: 'Diagnostics', icon: Shield }, { to: '/admin/health', label: 'Server health', icon: Server }, { to: '/admin/content', label: 'Content', icon: FileText }, { to: '/admin/settings', label: 'Settings', icon: Settings }] },
];

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  {
    path: '/patient',
    element: <RequireRole roles={['patient', 'student']}><DashboardLayout nav={patientNav} roleLabel="Patient / Student" /></RequireRole>,
    children: [
      { index: true, element: <Patient.Overview /> },
      { path: 'assistant', element: <Patient.Assistant /> },
      { path: 'learning', element: <Patient.Learning /> },
      { path: 'career', element: <Patient.Career /> },
    ],
  },
  {
    path: '/pro',
    element: <RequireRole roles={['professional']}><DashboardLayout nav={proNav} roleLabel="Medical professional" /></RequireRole>,
    children: [
      { index: true, element: <Pro.Overview /> },
      { path: 'queue', element: <Pro.Queue /> },
      { path: 'lab-review', element: <Pro.LabReview /> },
      { path: 'patients', element: <Pro.Patients /> },
      { path: 'research', element: <Pro.Research /> },
      { path: 'students', element: <Pro.Students /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireRole roles={['admin']}><DashboardLayout nav={adminNav} roleLabel="System operator" /></RequireRole>,
    children: [
      { index: true, element: <Admin.Overview /> },
      { path: 'users', element: <Admin.Users /> },
      { path: 'analytics', element: <Admin.Analytics /> },
      { path: 'diagnostics', element: <Admin.Diagnostics /> },
      { path: 'content', element: <Admin.Content /> },
      { path: 'settings', element: <Admin.Settings /> },
      { path: 'health', element: <Admin.Health /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);


export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading…</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
    </ThemeProvider>
  );
}
