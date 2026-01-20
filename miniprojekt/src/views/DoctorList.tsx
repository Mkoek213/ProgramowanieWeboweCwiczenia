import { useEffect, useState } from 'react';
import { useBackend } from '../contexts/BackendContext';
import { useAuth } from '../contexts/AuthContext';
import type { Doctor } from '../models/types';
import { Link } from 'react-router-dom';

export const DoctorList = () => {
    const { backend } = useBackend();
    const { user, isAuthenticated } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

    // Filtry i Sortowanie
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');

    // Unikalne specjalizacje do dropdowna
    const [specializations, setSpecializations] = useState<string[]>([]);

    useEffect(() => {
        backend.getDoctors().then(docs => {
            setDoctors(docs);
            const specs = Array.from(new Set(docs.map(d => d.specialization)));
            setSpecializations(specs);
        });
    }, [backend]);

    useEffect(() => {
        let result = [...doctors];

        // 1. Filtr tekstowy (Imie)
        if (searchTerm) {
            result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // 2. Filtr Kategorii (Specjalizacja)
        if (selectedSpec) {
            result = result.filter(d => d.specialization === selectedSpec);
        }

        // 3. Sortowanie
        result.sort((a, b) => {
            if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
            if (sortOrder === 'price-asc') return a.price - b.price;
            if (sortOrder === 'price-desc') return b.price - a.price;
            return 0;
        });

        setFilteredDoctors(result);
    }, [doctors, searchTerm, selectedSpec, sortOrder]);

    // Calculate average rating for a doctor
    const getAverageRating = (doc: Doctor): number => {
        if (!doc.reviews || doc.reviews.length === 0) return 0;
        const sum = doc.reviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / doc.reviews.length) * 10) / 10;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">👨‍⚕️ Lista Lekarzy</h2>

            {/* Guest info banner */}
            {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                    <p>
                        <strong>Gość:</strong> Widzisz listę lekarzy, ale aby zobaczyć szczegóły harmonogramu i zarezerwować wizytę,
                        <Link to="/login" className="text-blue-600 hover:underline ml-1">zaloguj się</Link> lub
                        <Link to="/register" className="text-blue-600 hover:underline ml-1">zarejestruj się</Link>.
                    </p>
                </div>
            )}

            {/* Pasek narzedzi: Szukanie, Filtrowanie, Sortowanie */}
            <div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Szukaj (Imię)</label>
                    <input
                        className="border p-2 w-full rounded"
                        placeholder="Np. Jan Kowalski..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Specjalizacja</label>
                    <select
                        className="border p-2 w-full rounded"
                        value={selectedSpec}
                        onChange={e => setSelectedSpec(e.target.value)}
                    >
                        <option value="">Wszystkie</option>
                        {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Sortowanie</label>
                    <select
                        className="border p-2 w-full rounded"
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                    >
                        <option value="name-asc">Nazwa A-Z</option>
                        <option value="name-desc">Nazwa Z-A</option>
                        <option value="price-asc">Cena rosnąco</option>
                        <option value="price-desc">Cena malejąco</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map(doc => {
                    const avgRating = getAverageRating(doc);

                    return (
                        <div key={doc.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col">
                            <img
                                src={doc.imageUrl || 'https://via.placeholder.com/300x200?text=Doctor'}
                                alt={doc.name}
                                className="w-full h-48 object-cover mb-3 rounded-lg"
                            />
                            <h3 className="text-xl font-bold">{doc.name}</h3>
                            <p className="text-blue-600 mb-2">{doc.specialization}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-yellow-500">
                                    {'★'.repeat(Math.round(avgRating))}
                                    {'☆'.repeat(5 - Math.round(avgRating))}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    ({doc.reviews?.length || 0} opinii)
                                </span>
                            </div>

                            <div className="text-gray-500 text-sm flex-grow line-clamp-2">
                                {doc.description}
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="font-bold text-green-600">{doc.price} PLN</span>

                                {isAuthenticated ? (
                                    <Link
                                        to={`/doctors/${doc.id}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Szczegóły
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                                    >
                                        Zaloguj się
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center text-gray-500">
                Znaleziono: {filteredDoctors.length} lekarzy
            </div>
        </div>
    );
};
