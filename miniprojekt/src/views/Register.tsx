import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/ui';

export const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('Podaj imię i nazwisko');
            return false;
        }
        if (!email.includes('@')) {
            setError('Podaj poprawny adres email');
            return false;
        }
        if (password.length < 4) {
            setError('Hasło musi mieć minimum 4 znaki');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        setError('');
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Use JWT auth service for registration
            const result = await authService.register({
                email,
                password,
                name,
                role: 'patient'
            });

            // Create user object for AuthContext
            const user = {
                id: String(result.user.id),
                email: result.user.email,
                role: 'patient' as const,
                name: result.user.name,
            };

            login(user);
            navigate('/');
        } catch (err: any) {
            if (err.message?.includes('Email already exists')) {
                setError('Użytkownik z tym adresem email już istnieje');
            } else {
                setError('Błąd podczas rejestracji. Sprawdź czy serwer działa.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
            <div className="card max-w-md w-full">
                <div className="text-center mb-6">
                    <span className="text-5xl">📝</span>
                    <h2 className="text-2xl font-bold mt-4">Rejestracja</h2>
                    <p className="text-gray-500 mt-1">Utwórz nowe konto pacjenta</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-down">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Imię i nazwisko
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input-field"
                            placeholder="Jan Kowalski"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adres email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="jan@example.com"
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
                            className="input-field"
                            placeholder="Minimum 4 znaki"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Powtórz hasło
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="Powtórz hasło"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full btn-success py-3 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Rejestruję...</span>
                            </>
                        ) : (
                            <>
                                <span>✓</span>
                                <span>Zarejestruj się</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Masz już konto?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Zaloguj się
                    </Link>
                </div>

                <div className="mt-4 text-xs text-gray-400 text-center">
                    <p>Rejestracja tworzy konto pacjenta.</p>
                    <p>Konta lekarzy są tworzone przez administratora.</p>
                </div>
            </div>
        </div>
    );
};
