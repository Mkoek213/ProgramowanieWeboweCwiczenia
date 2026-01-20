import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const Sidebar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cart } = useCart();
    const location = useLocation();
    const role = user?.role || 'guest';

    const isActive = (path: string) => location.pathname === path;

    const linkClass = (path: string) =>
        `block p-3 rounded-lg transition-colors ${isActive(path)
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-700 text-gray-300 hover:text-white'
        }`;

    return (
        <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
            {/* Logo */}
            <div className="p-4 text-2xl font-bold border-b border-gray-700 bg-gray-900">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-3xl">🏥</span>
                    <span>MedApp</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {/* Always visible */}
                <Link to="/" className={linkClass('/')}>
                    🏠 Strona Główna
                </Link>
                <Link to="/doctors" className={linkClass('/doctors')}>
                    👨‍⚕️ Lista Lekarzy
                </Link>

                {/* Guest only - Login/Register */}
                {!isAuthenticated && (
                    <>
                        <div className="border-t border-gray-700 my-4"></div>
                        <Link to="/login" className={linkClass('/login')}>
                            🔑 Logowanie
                        </Link>
                        <Link to="/register" className={linkClass('/register')}>
                            📝 Rejestracja
                        </Link>
                    </>
                )}

                {/* Patient menu */}
                {role === 'patient' && (
                    <>
                        <div className="border-t border-gray-700 my-4"></div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Pacjent</p>
                        <Link to="/my-appointments" className={linkClass('/my-appointments')}>
                            📅 Moje Wizyty
                            {cart.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                    </>
                )}

                {/* Doctor menu */}
                {role === 'doctor' && (
                    <>
                        <div className="border-t border-gray-700 my-4"></div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Lekarz</p>
                        <Link to="/my-schedule" className={linkClass('/my-schedule')}>
                            📋 Mój Harmonogram
                        </Link>
                    </>
                )}

                {/* Admin menu */}
                {role === 'admin' && (
                    <>
                        <div className="border-t border-gray-700 my-4"></div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Administrator</p>
                        <Link to="/admin" className={linkClass('/admin')}>
                            ⚙️ Panel Admina
                        </Link>
                    </>
                )}
            </nav>

            {/* User info footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
                {isAuthenticated && user ? (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user.name || user.email}</p>
                                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full mt-2 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                        >
                            🚪 Wyloguj
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <p className="text-sm">Niezalogowany</p>
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                            Zaloguj się →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
