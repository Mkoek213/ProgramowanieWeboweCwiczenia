import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBackend } from '../contexts/BackendContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Doctor, Appointment, Availability, Absence } from '../models/types';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { BookingModal } from '../components/BookingModal';
import { AddReview } from '../components/AddReview';
import { NotificationPolling } from '../components/NotificationPolling';
import axios from 'axios';

export const DoctorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { backend, backendType } = useBackend();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [doctor, setDoctor] = useState<Doctor | undefined>(undefined);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Reply state for reviews
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [notificationToast, setNotificationToast] = useState<string | null>(null);

    const loadData = async () => {
        if (!id) return;

        const [doc, appts, avails, abs] = await Promise.all([
            backend.getDoctorById(id),
            backend.getAppointmentsByDoctor(id),
            backend.getAvailabilitiesByDoctor(id),
            backend.getAbsencesByDoctor(id)
        ]);

        setDoctor(doc);
        setAppointments(appts);
        setAvailabilities(avails);
        setAbsences(abs);
    };

    useEffect(() => {
        loadData();
    }, [id, backend]);

    const handleSlotClick = (date: string, time: string) => {
        if (!user) {
            alert("Zaloguj się aby zarezerwować wizytę");
            return;
        }

        // Only patients can book appointments
        if (user.role !== 'patient') {
            alert("Tylko pacjenci mogą rezerwować wizyty");
            return;
        }

        // Check if this slot is already booked
        const slotDateTime = `${date} ${time}`;
        const existingBooking = appointments.find(appt => {
            if (appt.status === 'cancelled') return false;
            const apptTime = appt.date.split(' ')[1] || '';
            const apptDate = appt.date.split(' ')[0] || '';
            return apptDate === date && apptTime === time;
        });

        if (existingBooking) {
            alert("Ten slot jest już zarezerwowany. Wybierz inny termin.");
            return;
        }

        setSelectedDate(date);
        setSelectedTime(time);
        setShowBookingModal(true);
    };

    const handleBook = async (appointment: Appointment) => {
        addToCart(appointment);
        setShowBookingModal(false);
        alert("Dodano do koszyka! Przejdź do 'Moje Wizyty' aby sfinalizować rezerwację.");
    };

    const handleNotificationUpdate = (message: string) => {
        setNotificationToast(message);
        setTimeout(() => setNotificationToast(null), 5000); // Hide after 5 seconds
        // Also reload data to show updates
        loadData();
    };

    const handleReply = async (reviewId: string) => {
        if (!replyText || !doctor) return;

        const updatedReviews = doctor.reviews.map(r => {
            if (r.id === reviewId) {
                return { ...r, response: replyText };
            }
            return r;
        });

        const updatedDoc = { ...doctor, reviews: updatedReviews };

        if (backendType === 'json') {
            await axios.put(`http://localhost:3000/doctors/${doctor.id}`, updatedDoc);
            setDoctor(updatedDoc);
            setReplyingTo(null);
            setReplyText('');
        }
    };

    if (!doctor) return <div className="p-4">Ładowanie...</div>;

    return (
        <div className="p-4">
            {/* Real-time notification polling */}
            <NotificationPolling
                doctorId={doctor.id}
                isActive={true}
                onUpdate={handleNotificationUpdate}
            />

            {/* Toast notification */}
            {notificationToast && (
                <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
                    {notificationToast}
                </div>
            )}
            {/* Doctor Info Card */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={doctor.imageUrl || 'https://via.placeholder.com/200'}
                        alt={doctor.name}
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                        <p className="text-xl text-blue-600 mb-4">{doctor.specialization}</p>
                        <p className="text-gray-600 mb-4">{doctor.description}</p>
                        <p className="text-2xl font-bold text-green-600">
                            {doctor.price} PLN <span className="text-sm text-gray-500">/ 30 min</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">📅 Dostępne terminy</h2>
                <p className="text-gray-600 mb-4">
                    Kliknij na zielony slot, aby zarezerwować wizytę.
                </p>
                <WeeklyCalendar
                    doctorId={doctor.id}
                    appointments={appointments}
                    availabilities={availabilities}
                    absences={absences}
                    onSlotClick={handleSlotClick}
                />
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">⭐ Opinie pacjentów ({doctor.reviews.length})</h2>

                {doctor.reviews.length === 0 ? (
                    <p className="text-gray-500">Brak opinii</p>
                ) : (
                    <div className="space-y-4">
                        {doctor.reviews.map(rev => (
                            <div key={rev.id} className="border-b pb-4 last:border-b-0">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">{rev.author}</span>
                                    <span className="text-yellow-500">
                                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                    </span>
                                </div>
                                <p className="text-gray-700">{rev.text}</p>

                                {rev.response && (
                                    <div className="ml-4 mt-3 pl-4 border-l-2 border-blue-400 bg-blue-50 p-2 rounded">
                                        <p className="text-sm font-bold text-blue-600">Odpowiedź lekarza:</p>
                                        <p className="text-sm text-gray-700">{rev.response}</p>
                                    </div>
                                )}

                                {user && user.role === 'doctor' && !rev.response && (
                                    <div className="mt-2">
                                        {replyingTo === rev.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    className="border p-2 flex-1 rounded"
                                                    placeholder="Napisz odpowiedź..."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleReply(rev.id)}
                                                    className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
                                                >
                                                    Wyślij
                                                </button>
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="text-gray-500"
                                                >
                                                    Anuluj
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingTo(rev.id)}
                                                className="text-blue-500 text-sm underline"
                                            >
                                                Odpowiedz
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {user && user.role === 'patient' && (
                    <AddReview
                        doctorId={doctor.id}
                        onAdded={loadData}
                    />
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && doctor && (
                <BookingModal
                    doctor={doctor}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    existingAppointments={appointments}
                    onBook={handleBook}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </div>
    );
};
