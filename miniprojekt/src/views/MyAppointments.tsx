import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../contexts/BackendContext';
import type { Appointment, Doctor } from '../models/types';
import { CONSULTATION_TYPE_LABELS } from '../models/types';

export const MyAppointments = () => {
    const { cart, removeFromCart, confirmBooking, clearCart } = useCart();
    const { user } = useAuth();
    const { backend } = useBackend();

    const [history, setHistory] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [selectedForCancel, setSelectedForCancel] = useState<Appointment | null>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, backend]);

    const loadData = async () => {
        const [allAppts, allDocs] = await Promise.all([
            backend.getAppointmentsByPatient(String(user!.id)),
            backend.getDoctors()
        ]);
        setHistory(allAppts);
        setDoctors(allDocs);
    };

    const getDoctorName = (doctorId: string): string => {
        const doc = doctors.find(d => d.id === doctorId);
        return doc?.name || `Lekarz ${doctorId}`;
    };

    const calculateTotal = (): number => {
        return cart.reduce((sum, item) => {
            const doc = doctors.find(d => d.id === item.doctorId);
            const price = doc?.price || 0;
            const duration = item.duration || 1;
            return sum + (price * duration);
        }, 0);
    };

    const handleConfirmBooking = async () => {
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        // Simulate payment processing
        setPaymentComplete(true);
        await confirmBooking();
        await loadData();

        setTimeout(() => {
            setShowPaymentModal(false);
            setPaymentComplete(false);
        }, 2000);
    };

    const handleCancelAppointment = async () => {
        if (!selectedForCancel) return;

        try {
            console.log('Cancelling appointment:', selectedForCancel.id);
            await backend.cancelAppointment(selectedForCancel.id, 'Odwołane przez pacjenta');
            console.log('Appointment cancelled successfully');
            setSelectedForCancel(null);
            await loadData();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert(`Błąd podczas odwoływania wizyty: ${error}`);
        }
    };

    if (!user) return <div className="p-4">Zaloguj się aby zobaczyć swoje wizyty</div>;

    const pendingAppointments = history.filter(a => a.status === 'pending' || a.status === 'booked');
    const pastAppointments = history.filter(a => a.status === 'completed' || a.status === 'cancelled');

    return (
        <div className="p-4">
            {/* Cart Section */}
            <h2 className="text-2xl font-bold mb-4">🛒 Koszyk</h2>
            {cart.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded mb-8 text-center text-gray-500">
                    Koszyk jest pusty
                </div>
            ) : (
                <div className="bg-white p-4 rounded shadow mb-8">
                    <table className="w-full mb-4">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Lekarz</th>
                                <th className="text-left p-2">Data</th>
                                <th className="text-left p-2">Typ</th>
                                <th className="text-left p-2">Czas</th>
                                <th className="text-right p-2">Cena</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => {
                                const doc = doctors.find(d => d.id === item.doctorId);
                                const price = (doc?.price || 0) * (item.duration || 1);
                                return (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2">{getDoctorName(item.doctorId)}</td>
                                        <td className="p-2">{item.date}</td>
                                        <td className="p-2">
                                            {item.consultationType ? CONSULTATION_TYPE_LABELS[item.consultationType] : '-'}
                                        </td>
                                        <td className="p-2">{(item.duration || 1) * 30} min</td>
                                        <td className="p-2 text-right font-bold">{price} PLN</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50">
                                <td colSpan={4} className="p-2 font-bold">RAZEM</td>
                                <td className="p-2 text-right font-bold text-lg">{calculateTotal()} PLN</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => clearCart()}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Wyczyść koszyk
                        </button>
                        <button
                            onClick={handleConfirmBooking}
                            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Przejdź do płatności
                        </button>
                    </div>
                </div>
            )}

            {/* Upcoming Appointments */}
            <h2 className="text-2xl font-bold mb-4">📅 Nadchodzące wizyty</h2>
            {pendingAppointments.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded mb-8 text-center text-gray-500">
                    Brak nadchodzących wizyt
                </div>
            ) : (
                <div className="space-y-3 mb-8">
                    {pendingAppointments.map(appt => (
                        <div key={appt.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <p className="font-bold">{getDoctorName(appt.doctorId)}</p>
                                <p className="text-gray-600">{appt.date}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded ${appt.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {appt.status === 'booked' ? 'Potwierdzona' : 'Oczekuje'}
                                    </span>
                                    {appt.consultationType && (
                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                            {CONSULTATION_TYPE_LABELS[appt.consultationType]}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedForCancel(appt)}
                                className="text-red-500 hover:text-red-700 border border-red-300 px-3 py-1 rounded"
                            >
                                Odwołaj
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Past Appointments */}
            <h2 className="text-2xl font-bold mb-4">📋 Historia wizyt</h2>
            {pastAppointments.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
                    Brak historii wizyt
                </div>
            ) : (
                <div className="space-y-2">
                    {pastAppointments.map(appt => (
                        <div key={appt.id} className={`p-3 rounded ${appt.status === 'cancelled' ? 'bg-red-50' : 'bg-gray-100'
                            }`}>
                            <div className="flex justify-between">
                                <span>{getDoctorName(appt.doctorId)}</span>
                                <span className="text-gray-500">{appt.date}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${appt.status === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-gray-200'
                                }`}>
                                {appt.status === 'cancelled' ? 'Odwołana' : 'Zakończona'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={paymentComplete ? () => { setShowPaymentModal(false); setPaymentComplete(false); } : undefined}
                >
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        {!paymentComplete ? (
                            <>
                                <h3 className="text-xl font-bold mb-4">💳 Symulacja płatności</h3>
                                <div className="bg-gray-100 p-4 rounded mb-4">
                                    <p className="text-lg">Kwota do zapłaty:</p>
                                    <p className="text-3xl font-bold text-green-600">{calculateTotal()} PLN</p>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    To jest symulacja płatności. W rzeczywistej aplikacji zostałbyś przekierowany do bramki płatniczej.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Zapłać teraz
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div
                                className="text-center py-8 cursor-pointer"
                                onClick={() => { setShowPaymentModal(false); setPaymentComplete(false); }}
                            >
                                <div className="text-6xl mb-4">✅</div>
                                <h3 className="text-xl font-bold text-green-600">Płatność zakończona!</h3>
                                <p className="text-gray-600 mb-4">Twoje wizyty zostały potwierdzone.</p>
                                <button
                                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    OK, zamknij
                                </button>
                                <p className="text-xs text-gray-400 mt-2">Kliknij gdziekolwiek aby zamknąć</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {selectedForCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">⚠️ Potwierdź odwołanie</h3>
                        <p className="mb-4">
                            Czy na pewno chcesz odwołać wizytę u <strong>{getDoctorName(selectedForCancel.doctorId)}</strong> w dniu <strong>{selectedForCancel.date}</strong>?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedForCancel(null)}
                                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Nie, zachowaj
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Tak, odwołaj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
