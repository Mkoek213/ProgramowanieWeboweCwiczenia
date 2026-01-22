import { useState } from 'react';
import type { Absence, Appointment } from '../models/types';

interface AbsenceManagerProps {
    doctorId: string;
    absences: Absence[];
    appointments: Appointment[];
    onAdd: (absence: Absence, cancelAppointments: string[]) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const AbsenceManager = ({
    doctorId,
    absences,
    appointments,
    onAdd,
    onDelete
}: AbsenceManagerProps) => {
    const [showForm, setShowForm] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [conflictingAppts, setConflictingAppts] = useState<Appointment[]>([]);
    const [showConflictWarning, setShowConflictWarning] = useState(false);

    const findConflicts = (start: string, end: string): Appointment[] => {
        return appointments.filter(appt => {
            if (appt.doctorId !== doctorId) return false;
            if (appt.status === 'cancelled') return false;

            const apptDate = appt.date.split(' ')[0];
            return apptDate >= start && apptDate <= end;
        });
    };

    const handleCheckConflicts = () => {
        if (!startDate || !endDate) {
            alert('Podaj daty początku i końca nieobecności');
            return;
        }

        if (startDate > endDate) {
            alert('Data końca musi być późniejsza niż data początku');
            return;
        }

        const conflicts = findConflicts(startDate, endDate);
        setConflictingAppts(conflicts);

        if (conflicts.length > 0) {
            setShowConflictWarning(true);
        } else {
            handleSubmit([]);
        }
    };

    const handleSubmit = async (appointmentsToCancel: string[]) => {
        const absence: Absence = {
            id: Date.now().toString(),
            doctorId,
            startDate,
            endDate,
            reason: reason || undefined,
            affectedAppointments: appointmentsToCancel.length > 0 ? appointmentsToCancel : undefined
        };

        await onAdd(absence, appointmentsToCancel);
        resetForm();
    };

    const handleConfirmWithCancellation = () => {
        const idsToCancel = conflictingAppts.map(a => a.id);
        handleSubmit(idsToCancel);
    };

    const resetForm = () => {
        setShowForm(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setConflictingAppts([]);
        setShowConflictWarning(false);
    };

    const myAbsences = absences.filter(a => a.doctorId === doctorId);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Nieobecności</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    {showForm ? 'Anuluj' : '+ Dodaj nieobecność'}
                </button>
            </div>

            {showForm && !showConflictWarning && (
                <div className="border rounded p-4 mb-4 bg-red-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block font-medium mb-1">Od daty:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Do daty:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Powód (opcjonalnie):</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="np. Urlop, konferencja, choroba..."
                            className="border p-2 w-full rounded"
                        />
                    </div>

                    <button
                        onClick={handleCheckConflicts}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                    >
                        Sprawdź konflikty i zapisz
                    </button>
                </div>
            )}

            {}
            {showConflictWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                        <h3 className="text-xl font-bold text-red-600 mb-4">
                            Wykryto konflikty!
                        </h3>
                        <p className="mb-4">
                            W okresie {startDate} - {endDate} masz {conflictingAppts.length} zarezerwowanych wizyt:
                        </p>
                        <div className="max-h-48 overflow-auto mb-4 border rounded">
                            {conflictingAppts.map(appt => (
                                <div key={appt.id} className="p-2 border-b last:border-b-0">
                                    <strong>{appt.date}</strong> - {appt.patientName || 'Pacjent'}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Czy chcesz odwołać te wizyty i dodać nieobecność?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleConfirmWithCancellation}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Odwołaj wizyty i dodaj nieobecność
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            <div className="space-y-2">
                {myAbsences.length === 0 ? (
                    <p className="text-gray-500">Brak zdefiniowanych nieobecności</p>
                ) : (
                    myAbsences.map(abs => (
                        <div key={abs.id} className="border border-red-200 bg-red-50 rounded p-3 flex justify-between items-start">
                            <div>
                                <p className="font-medium">{abs.startDate} - {abs.endDate}</p>
                                {abs.reason && <p className="text-sm text-gray-600">Powód: {abs.reason}</p>}
                                {abs.affectedAppointments && abs.affectedAppointments.length > 0 && (
                                    <p className="text-sm text-red-600">
                                        Odwołano {abs.affectedAppointments.length} wizyt
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => onDelete(abs.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Usuń
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
