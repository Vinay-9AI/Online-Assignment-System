import { LoginPage } from './components/LoginPage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, logout } = useAuth();

  if (!user) return <LoginPage />;

  if (user.role === 'teacher') return <TeacherDashboard username={user.name} onLogout={logout} />;

  return <StudentDashboard username={user.name} onLogout={logout} />;
}