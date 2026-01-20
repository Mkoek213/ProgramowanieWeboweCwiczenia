import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../contexts/BackendContext';
import type { Appointment, Doctor, Availability, Absence } from '../models/types';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { AvailabilityManager } from '../components/AvailabilityManager';
import { AbsenceManager } from '../components/AbsenceManager';

export const MySchedule = () => {
    const { user } = useAuth();
    const { backend } = useBackend();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [myDoctorProfile, setMyDoctorProfile] = useState<Doctor | undefined>(undefined);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [activeTab, setActiveTab] = useState<'calendar' | 'availability' | 'absences'>('calendar');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Get doctor ID from user
    const getDoctorId = () => {
        if (!user) return '';
        // Mapping user to doctor - in real app would be more robust
        return user.email === 'jan@lekarz.pl' ? '1' : user.id;
    };

    const refreshData = async () => {
        if (!user || user.role !== 'doctor') return;

        const docId = getDoctorId();

        const [allAppts, allAvails, allAbsences, doctorProfile] = await Promise.all([
            backend.getAppointmentsByDoctor(docId),
            backend.getAvailabilitiesByDoctor(docId),
            backend.getAbsencesByDoctor(docId),
            backend.getDoctorById(docId)
        ]);

        setAppointments(allAppts);
        setAvailabilities(allAvails);
        setAbsences(allAbsences);
        setMyDoctorProfile(doctorProfile);
    };

    useEffect(() => {
        refreshData();
    }, [user, backend]);

    // Availability handlers
    const handleAddAvailability = async (av: Availability) => {
        await backend.addAvailability(av);
        await refreshData();
    };

    const handleDeleteAvailability = async (id: string) => {
        await backend.deleteAvailability(id);
        await refreshData();
    };

    // Absence handlers
    const handleAddAbsence = async (absence: Absence, cancelAppointments: string[]) => {
        // Cancel affected appointments first
        for (const apptId of cancelAppointments) {
            await backend.cancelAppointment(apptId, 'Nieobecność lekarza');
        }
        await backend.addAbsence(absence);
        await refreshData();
    };

    const handleDeleteAbsence = async (id: string) => {
        await backend.deleteAbsence(id);
        await refreshData();
    };

    // Handle appointment click in calendar
    const handleAppointmentClick = (appt: Appointment) => {
        setSelectedAppointment(appt);
    };

    // Cancel appointment from detail modal
    const handleCancelAppointment = async (apptId: string) => {
        await backend.cancelAppointment(apptId, 'Odwołane przez lekarza');
        setSelectedAppointment(null);
        await refreshData();
    };

    if (!user || user.role !== 'doctor') {
        return <div className="p-4">Brak dostępu. Zaloguj się jako lekarz.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Mój Harmonogram</h2>

            {myDoctorProfile && (
                <div className="bg-blue-50 p-3 rounded mb-4">
                    <p className="font-bold">{myDoctorProfile.name}</p>
                    <p className="text-blue-600">{myDoctorProfile.specialization}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 rounded ${activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    📅 Kalendarz
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    className={`px-4 py-2 rounded ${activeTab === 'availability' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                >
                    ⏰ Dostępność
                </button>
                <button
                    onClick={() => setActiveTab('absences')}
                    className={`px-4 py-2 rounded ${activeTab === 'absences' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                    🚫 Nieobecności
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'calendar' && myDoctorProfile && (
                <WeeklyCalendar
                    doctorId={myDoctorProfile.id}
                    appointments={appointments}
                    availabilities={availabilities}
                    absences={absences}
                    onAppointmentClick={handleAppointmentClick}
                />
            )}

            {activeTab === 'availability' && myDoctorProfile && (
                <AvailabilityManager
                    doctorId={myDoctorProfile.id}
                    availabilities={availabilities}
                    onAdd={handleAddAvailability}
                    onDelete={handleDeleteAvailability}
                />
            )}

            {activeTab === 'absences' && myDoctorProfile && (
                <AbsenceManager
                    doctorId={myDoctorProfile.id}
                    absences={absences}
                    appointments={appointments}
                    onAdd={handleAddAbsence}
                    onDelete={handleDeleteAbsence}
                />
            )}

            {/* Appointment detail modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Szczegóły wizyty</h3>
                        <div className="space-y-2 mb-4">
                            <p><strong>Data:</strong> {selectedAppointment.date}</p>
                            <p><strong>Pacjent:</strong> {selectedAppointment.patientName || 'Brak danych'}</p>
                            <p><strong>Płeć:</strong> {
                                selectedAppointment.patientGender === 'male' ? 'Mężczyzna' :
                                    selectedAppointment.patientGender === 'female' ? 'Kobieta' : 'Inna'
                            }</p>
                            {selectedAppointment.patientAge && (
                                <p><strong>Wiek:</strong> {selectedAppointment.patientAge} lat</p>
                            )}
                            <p><strong>Typ wizyty:</strong> {selectedAppointment.consultationType || 'Nie określono'}</p>
                            <p><strong>Czas trwania:</strong> {(selectedAppointment.duration || 1) * 30} min</p>
                            <p><strong>Status:</strong> {selectedAppointment.status}</p>
                            {selectedAppointment.notes && (
                                <div>
                                    <strong>Notatki:</strong>
                                    <p className="text-gray-600 bg-gray-50 p-2 rounded mt-1">{selectedAppointment.notes}</p>
                                </div>
                            )}
                            {selectedAppointment.documents && selectedAppointment.documents.length > 0 && (
                                <div>
                                    <strong>Dokumenty:</strong>
                                    <ul className="text-sm text-gray-600">
                                        {selectedAppointment.documents.map(doc => (
                                            <li key={doc.id}>📎 {doc.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Zamknij
                            </button>
                            {selectedAppointment.status !== 'cancelled' && (
                                <button
                                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Odwołaj wizytę
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
