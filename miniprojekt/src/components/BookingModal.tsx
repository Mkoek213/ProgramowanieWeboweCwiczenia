import { useState } from 'react';
import type { Appointment, ConsultationType, DocumentAttachment, Doctor } from '../models/types';
import { CONSULTATION_TYPE_LABELS } from '../models/types';

interface BookingModalProps {
    doctor: Doctor;
    selectedDate: string;    
    selectedTime: string;   
    existingAppointments: Appointment[];
    onBook: (appointment: Appointment) => Promise<void>;
    onClose: () => void;
}

export const BookingModal = ({
    doctor,
    selectedDate,
    selectedTime,
    existingAppointments,
    onBook,
    onClose
}: BookingModalProps) => {
    const [duration, setDuration] = useState(1); 
    const [consultationType, setConsultationType] = useState<ConsultationType>('first_visit');
    const [patientName, setPatientName] = useState('');
    const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
    const [patientAge, setPatientAge] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkConflicts = (slots: number): string | null => {
        const [startHour, startMin] = selectedTime.split(':').map(Number);
        const startMins = startHour * 60 + startMin;
        const endMins = startMins + (slots * 30);

        for (const appt of existingAppointments) {
            if (appt.doctorId !== doctor.id) continue;
            if (appt.status === 'cancelled') continue;

            const apptDatePart = appt.date.split(' ')[0];
            if (apptDatePart !== selectedDate) continue;

            const apptTimePart = appt.date.split(' ')[1] || '';
            const [apptHour, apptMin] = apptTimePart.split(':').map(Number);
            const apptStartMins = apptHour * 60 + apptMin;
            const apptEndMins = apptStartMins + ((appt.duration || 1) * 30);

            if (startMins < apptEndMins && endMins > apptStartMins) {
                return `Konflikt z istniejącą wizytą o ${apptTimePart}`;
            }
        }
        return null;
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        const conflict = checkConflicts(newDuration);
        setConflictError(conflict);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newDocs: DocumentAttachment[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newDocs.push({
                id: Date.now().toString() + i,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
            });
        }
        setDocuments([...documents, ...newDocs]);
    };

    const removeDocument = (id: string) => {
        setDocuments(documents.filter(d => d.id !== id));
    };

    const handleSubmit = async () => {
        if (!patientName.trim()) {
            alert('Podaj imię i nazwisko pacjenta');
            return;
        }

        if (conflictError) {
            alert('Nie można zarezerwować - wykryto konflikt');
            return;
        }

        setIsSubmitting(true);

        const appointment: Appointment = {
            id: Date.now().toString(),
            doctorId: doctor.id,
            patientId: '', 
            date: `${selectedDate} ${selectedTime}`,
            duration,
            status: 'pending',
            consultationType,
            patientName,
            patientGender,
            patientAge: patientAge === '' ? undefined : patientAge,
            notes: notes || undefined,
            documents: documents.length > 0 ? documents : undefined
        };

        try {
            await onBook(appointment);
            onClose();
        } catch (error) {
            alert('Błąd podczas rezerwacji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalMinutes = duration * 30;
    const totalPrice = doctor.price * (totalMinutes / 30);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Rezerwacja wizyty</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">

                    </button>
                </div>

                {}
                <div className="bg-blue-50 p-3 rounded mb-4">
                    <p className="font-bold">{doctor.name}</p>
                    <p className="text-blue-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600">Cena za 30 min: {doctor.price} PLN</p>
                </div>

                {}
                <div className="mb-4">
                    <p className="font-medium">Wybrany termin:</p>
                    <p className="text-lg">{selectedDate} o {selectedTime}</p>
                </div>

                {}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Czas trwania wizyty:</label>
                    <select
                        value={duration}
                        onChange={e => handleDurationChange(Number(e.target.value))}
                        className="border p-2 w-full rounded"
                    >
                        <option value={1}>30 minut (1 slot)</option>
                        <option value={2}>60 minut (2 sloty)</option>
                        <option value={3}>90 minut (3 sloty)</option>
                        <option value={4}>120 minut (4 sloty)</option>
                    </select>
                    {conflictError && (
                        <p className="text-red-500 text-sm mt-1">{conflictError}</p>
                    )}
                </div>

                {}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Typ wizyty:</label>
                    <select
                        value={consultationType}
                        onChange={e => setConsultationType(e.target.value as ConsultationType)}
                        className="border p-2 w-full rounded"
                    >
                        {Object.entries(CONSULTATION_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Dane pacjenta:</label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="Imię i nazwisko *"
                        className="border p-2 w-full rounded mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={patientGender}
                            onChange={e => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                            className="border p-2 rounded"
                        >
                            <option value="male">Mężczyzna</option>
                            <option value="female">Kobieta</option>
                            <option value="other">Inna</option>
                        </select>
                        <input
                            type="number"
                            value={patientAge}
                            onChange={e => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Wiek"
                            min={0}
                            max={150}
                            className="border p-2 rounded"
                        />
                    </div>
                </div>

                {}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Informacje dla lekarza:</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Opisz swoje dolegliwości, alergie, przyjmowane leki..."
                        className="border p-2 w-full rounded h-24"
                    />
                </div>

                {}
                <div className="mb-4">
                    <label className="block font-medium mb-2">Dokumenty (wyniki badań, skierowania):</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="border p-2 w-full rounded"
                    />
                    {documents.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="text-sm truncate">{doc.name}</span>
                                    <button
                                        onClick={() => removeDocument(doc.id)}
                                        className="text-red-500 text-sm"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {}
                <div className="bg-gray-100 p-3 rounded mb-4">
                    <div className="flex justify-between">
                        <span>Czas trwania:</span>
                        <span>{totalMinutes} minut</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Do zapłaty:</span>
                        <span>{totalPrice} PLN</span>
                    </div>
                </div>

                {}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !!conflictError}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Rezerwuję...' : 'Dodaj do koszyka'}
                    </button>
                </div>
            </div>
        </div>
    );
};
