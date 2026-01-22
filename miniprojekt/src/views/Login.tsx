import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/ui';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (!email) {
            setError('Podaj adres email');
            return;
        }
        if (!password) {
            setError('Podaj hasło');
            return;
        }

        setIsLoading(true);

        try {
            // Use JWT auth service
            const result = await authService.login({ email, password });

            const user = {
                id: String(result.user.id),
                email: result.user.email,
                role: result.user.role as 'guest' | 'patient' | 'doctor' | 'admin',
                name: result.user.name,
            };

            login(user);
            navigate('/');
        } catch (err: any) {
            if (err.message?.includes('Cannot find user') || err.message?.includes('Incorrect password')) {
                setError('Nieprawidłowy email lub hasło');
            } else {
                setError('Błąd podczas logowania. Sprawdź czy serwer działa.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
            <div className="card max-w-md w-full">
                <div className="text-center mb-6">
                    <span className="text-5xl"></span>
                    <h2 className="text-2xl font-bold mt-4">Logowanie</h2>
                    <p className="text-gray-500 mt-1">Zaloguj się do swojego konta</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-down">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adres email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="input-field"
                            placeholder="twoj@email.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hasło
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="input-field"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Loguję...</span>
                            </>
                        ) : (
                            <>
                                <span></span>
                                <span>Zaloguj się</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Nie masz konta?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Zarejestruj się
                    </Link>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Konta testowe:</p>
                    <div className="text-xs text-gray-500 space-y-1 font-mono">
                        <p><strong>Admin:</strong> admin@admin.com / test123</p>
                        <p><strong>Lekarz:</strong> jan@lekarz.pl / test123</p>
                        <p><strong>Pacjent:</strong> pacjent@test.pl / test123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
