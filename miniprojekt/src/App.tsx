import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BackendProvider } from './contexts/BackendContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';
import { PrivateRoute, GuestOnlyRoute } from './components/PrivateRoute';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { DoctorList } from './views/DoctorList';
import { DoctorDetail } from './views/DoctorDetail';
import { AdminPanel } from './views/AdminPanel';
import { MyAppointments } from './views/MyAppointments';
import { MySchedule } from './views/MySchedule';
import { useAuth } from './contexts/AuthContext';
import { Link } from 'react-router-dom';

// Home page with role-based content
const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="text-6xl">🏥</span>
        </div>
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          MedApp
        </h1>
        <p className="text-xl text-gray-600">
          System rezerwacji wizyt lekarskich online
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center hover-lift">
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h3 className="font-bold text-lg mb-2">Znajdź lekarza</h3>
              <p className="text-gray-500 text-sm">Przeglądaj specjalistów z różnych dziedzin</p>
            </div>
            <div className="card text-center hover-lift">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-bold text-lg mb-2">Zarezerwuj wizytę</h3>
              <p className="text-gray-500 text-sm">Wybierz dogodny termin online</p>
            </div>
            <div className="card text-center hover-lift">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-bold text-lg mb-2">Oceń wizytę</h3>
              <p className="text-gray-500 text-sm">Podziel się opinią o lekarzu</p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="card glass text-center">
            <h2 className="text-2xl font-bold mb-4">Rozpocznij już dziś!</h2>
            <p className="text-gray-600 mb-6">
              Zarejestruj się lub zaloguj, aby uzyskać pełny dostęp do systemu rezerwacji.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="btn-primary text-lg px-8 py-3">
                🔑 Zaloguj się
              </Link>
              <Link to="/register" className="btn-success text-lg px-8 py-3">
                📝 Zarejestruj się
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="card glass">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-gray-500">Witaj ponownie,</p>
                <h2 className="text-2xl font-bold">{user?.name || user?.email}</h2>
              </div>
            </div>
          </div>

          {user?.role === 'patient' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/doctors" className="card hover-lift group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Znajdź lekarza</h3>
                    <p className="text-gray-500 text-sm">Przeglądaj specjalistów</p>
                  </div>
                </div>
              </Link>
              <Link to="/my-appointments" className="card hover-lift group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📅
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Moje wizyty</h3>
                    <p className="text-gray-500 text-sm">Zarządzaj rezerwacjami</p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {user?.role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/my-schedule" className="card hover-lift group bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mój harmonogram</h3>
                    <p className="text-gray-600 text-sm">Zarządzaj wizytami i dostępnością</p>
                  </div>
                </div>
              </Link>
              <div className="card">
                <h4 className="font-semibold mb-3">Szybkie akcje:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Dodaj dostępność cykliczną</li>
                  <li>✓ Zgłoś nieobecność</li>
                  <li>✓ Odpowiedz na opinie</li>
                </ul>
              </div>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/admin" className="card hover-lift bg-gradient-to-br from-purple-50 to-purple-100 group">
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                  <h3 className="font-bold">Użytkownicy</h3>
                  <p className="text-sm text-gray-600">Zarządzaj kontami</p>
                </div>
              </Link>
              <Link to="/admin" className="card hover-lift bg-gradient-to-br from-blue-50 to-blue-100 group">
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                  <h3 className="font-bold">Lekarze</h3>
                  <p className="text-sm text-gray-600">Dodaj / usuń lekarzy</p>
                </div>
              </Link>
              <Link to="/admin" className="card hover-lift bg-gradient-to-br from-gray-50 to-gray-100 group">
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                  <h3 className="font-bold">Ustawienia</h3>
                  <p className="text-sm text-gray-600">Konfiguracja systemu</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


function App() {
  return (
    <DebugErrorBoundary>
      <BackendProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter>
                <MainLayout>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/doctors" element={<DoctorList />} />

                    {/* Guest only routes (redirect if logged in) */}
                    <Route path="/login" element={
                      <GuestOnlyRoute>
                        <Login />
                      </GuestOnlyRoute>
                    } />
                    <Route path="/register" element={
                      <GuestOnlyRoute>
                        <Register />
                      </GuestOnlyRoute>
                    } />

                    {/* Protected: Any logged in user */}
                    <Route path="/doctors/:id" element={
                      <PrivateRoute requireAuth={true}>
                        <DoctorDetail />
                      </PrivateRoute>
                    } />

                    {/* Protected: Patients only */}
                    <Route path="/my-appointments" element={
                      <PrivateRoute allowedRoles={['patient']}>
                        <MyAppointments />
                      </PrivateRoute>
                    } />

                    {/* Protected: Doctors only */}
                    <Route path="/my-schedule" element={
                      <PrivateRoute allowedRoles={['doctor']}>
                        <MySchedule />
                      </PrivateRoute>
                    } />

                    {/* Protected: Admin only */}
                    <Route path="/admin" element={
                      <PrivateRoute allowedRoles={['admin']}>
                        <AdminPanel />
                      </PrivateRoute>
                    } />
                    <Route path="/admin/users" element={
                      <PrivateRoute allowedRoles={['admin']}>
                        <AdminPanel />
                      </PrivateRoute>
                    } />
                    <Route path="/admin/doctors" element={
                      <PrivateRoute allowedRoles={['admin']}>
                        <AdminPanel />
                      </PrivateRoute>
                    } />
                  </Routes>
                </MainLayout>
              </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </BackendProvider>
    </DebugErrorBoundary>
  );
}

export default App;
