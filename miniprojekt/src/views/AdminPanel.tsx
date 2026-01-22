import { useEffect, useState } from 'react';
import { useAuth, type PersistenceMode } from '../contexts/AuthContext';
import { useBackend } from '../contexts/BackendContext';
import type { User, Doctor } from '../models/types';
import { authService } from '../services/authService';

export const AdminPanel = () => {
    const { user, persistenceMode, setPersistenceMode } = useAuth();
    const { backend, backendType } = useBackend();
    const [users, setUsers] = useState<User[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [activeTab, setActiveTab] = useState<'doctors' | 'users' | 'settings'>('doctors');

    // Formularz dodawania lekarza
    const [newDrName, setNewDrName] = useState('');
    const [newDrSpec, setNewDrSpec] = useState('');
    const [newDrPrice, setNewDrPrice] = useState(100);
    const [newDrEmail, setNewDrEmail] = useState('');
    const [newDrPassword, setNewDrPassword] = useState('');

    const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            refreshData();
        }
    }, [user, backend]);

    const refreshData = () => {
        Promise.all([backend.getUsers(), backend.getDoctors()]).then(([u, d]) => {
            setUsers(u);
            setDoctors(d);
            setAvailableSpecs(Array.from(new Set(d.map(doc => doc.specialization))));
        });
    };

    const toggleBan = async (u: User) => {
        const newStatus = !u.isBanned;
        if (backendType === 'json') {
            try {
                await authService.authFetch(`http://localhost:3000/users/${u.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isBanned: newStatus })
                });
                setUsers(users.map(us => us.id === u.id ? { ...us, isBanned: newStatus } : us));
            } catch (e) { alert('Err: ' + e); }
        }
    };

    const handleDeleteDoctor = async (id: string) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tego lekarza?")) return;

        if (backendType === 'json') {
            await authService.authFetch(`http://localhost:3000/doctors/${id}`, { method: 'DELETE' });

            const docUser = users.find(u => u.id === id || u.email.includes('@lekarz'));
            if (docUser) {
                try {
                    await authService.authFetch(`http://localhost:3000/users/${docUser.id}`, { method: 'DELETE' });
                } catch { }
            }
            refreshData();
        }
    };

    const handleDeleteReview = async (doctorId: string, reviewId: string) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) return;

        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor && backendType === 'json') {
            const updatedReviews = doctor.reviews.filter(r => r.id !== reviewId);
            await authService.authFetch(`http://localhost:3000/doctors/${doctorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviews: updatedReviews })
            });
            refreshData();
        }
    };

    const handleAddDoctor = async () => {
        if (!newDrName || !newDrSpec || !newDrEmail || !newDrPassword) {
            alert('Podaj wszystkie dane lekarza (nazwa, specjalizacja, email, hasło)');
            return;
        }

        const newDoc: Doctor = {
            id: Date.now().toString(),
            name: newDrName,
            specialization: newDrSpec,
            price: newDrPrice,
            description: "Nowy lekarz w systemie",
            imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
            reviews: [],
            schedule: []
        };

        const newUser: User = {
            id: newDoc.id,
            email: newDrEmail,
            password: newDrPassword, 
            role: 'doctor',
            name: newDrName
        };

        if (backendType === 'json') {
            await backend.addDoctor(newDoc);
            await authService.authFetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            alert(`Dodano lekarza!\nLogin: ${newUser.email}`);
            refreshData();
            setNewDrName('');
            setNewDrSpec('');
            setNewDrEmail('');
            setNewDrPassword('');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Brak dostępu</h2>
                <p className="text-gray-600">Ta strona jest dostępna tylko dla administratorów.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Panel Administratora</h2>

            {}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('doctors')}
                    className={`px-4 py-2 rounded ${activeTab === 'doctors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Lekarze
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Użytkownicy
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Ustawienia
                </button>
            </div>

            {}
            {activeTab === 'doctors' && (
                <div className="space-y-6">
                    {}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Dodaj Lekarza</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                className="border p-2 rounded"
                                placeholder="Imię Nazwisko"
                                value={newDrName}
                                onChange={e => setNewDrName(e.target.value)}
                            />
                            <input
                                list="specs"
                                className="border p-2 rounded"
                                placeholder="Specjalizacja"
                                value={newDrSpec}
                                onChange={e => setNewDrSpec(e.target.value)}
                            />
                            <datalist id="specs">
                                {availableSpecs.map(s => <option key={s} value={s} />)}
                            </datalist>
                            <input
                                className="border p-2 rounded"
                                type="number"
                                placeholder="Cena"
                                value={newDrPrice}
                                onChange={e => setNewDrPrice(Number(e.target.value))}
                            />
                            <input
                                className="border p-2 rounded"
                                type="email"
                                placeholder="Email (login)"
                                value={newDrEmail}
                                onChange={e => setNewDrEmail(e.target.value)}
                            />
                            <input
                                className="border p-2 rounded"
                                type="password"
                                placeholder="Hasło"
                                value={newDrPassword}
                                onChange={e => setNewDrPassword(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleAddDoctor}
                            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Dodaj lekarza
                        </button>
                    </div>

                    {}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Lista Lekarzy</h3>
                        <div className="space-y-4">
                            {doctors.map(d => (
                                <div key={d.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-bold">{d.name}</span>
                                            <span className="text-gray-500 ml-2">({d.specialization})</span>
                                            <span className="text-green-600 ml-2">{d.price} PLN</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDoctor(d.id)}
                                            className="text-red-500 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
                                        >
                                            Usuń lekarza
                                        </button>
                                    </div>

                                    {}
                                    {d.reviews.length > 0 && (
                                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Opinie ({d.reviews.length}):</p>
                                            {d.reviews.map(r => (
                                                <div key={r.id} className="flex justify-between items-start mb-2 text-sm bg-gray-50 p-2 rounded">
                                                    <div>
                                                        <span className="font-medium">{r.author}</span>
                                                        <span className="text-yellow-500 ml-2">{''.repeat(r.rating)}</span>
                                                        <p className="text-gray-600">{r.text}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReview(d.id, r.id)}
                                                        className="text-red-400 hover:text-red-600 text-xs"
                                                    >
                                                        Usuń
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {}
            {activeTab === 'users' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Zarządzanie Użytkownikami</h3>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Email</th>
                                <th className="text-left p-2">Nazwa</th>
                                <th className="text-left p-2">Rola</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-right p-2">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className={`border-b ${u.isBanned ? 'bg-red-50' : ''}`}>
                                    <td className="p-2">{u.email}</td>
                                    <td className="p-2">{u.name || '-'}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        {u.isBanned ? (
                                            <span className="text-red-600 text-sm">Zbanowany</span>
                                        ) : (
                                            <span className="text-green-600 text-sm">Aktywny</span>
                                        )}
                                    </td>
                                    <td className="p-2 text-right">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleBan(u)}
                                                className={`text-sm px-3 py-1 rounded ${u.isBanned
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {u.isBanned ? 'Odbanuj' : 'Zbanuj'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Źródło danych</h3>
                        <p className="text-gray-600 mb-2">Aktualnie: <strong>JSON Server</strong></p>
                        <p className="text-sm text-gray-400">
                            Dane są przechowywane lokalnie w pliku db.json
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Persystencja logowania</h3>
                        <p className="text-gray-600 mb-2">Aktualnie: <strong>{persistenceMode}</strong></p>
                        <div className="flex gap-2">
                            {(['LOCAL', 'SESSION', 'NONE'] as PersistenceMode[]).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setPersistenceMode(m)}
                                    className={`px-4 py-2 rounded border ${persistenceMode === m
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            LOCAL = zapamiętaj między sesjami<br />
                            SESSION = tylko ta karta<br />
                            NONE = wyloguj przy odświeżeniu
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
