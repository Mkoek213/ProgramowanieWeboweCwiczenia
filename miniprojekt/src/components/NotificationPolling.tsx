import { useEffect, useRef } from 'react';
import { useBackend } from '../contexts/BackendContext';
import type { Appointment, Availability, Absence } from '../models/types';

interface NotificationPollingProps {
    doctorId: string;
    isActive: boolean;  // Only poll when user is viewing this doctor
    onUpdate?: (message: string) => void;  // Callback for showing notifications
}

export const NotificationPolling: React.FC<NotificationPollingProps> = ({ doctorId, isActive, onUpdate }) => {
    const { backend } = useBackend();
    const previousDataRef = useRef<{
        appointments: Appointment[];
        availabilities: Availability[];
        absences: Absence[];
    } | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const pollForChanges = async () => {
            try {
                const [appointments, availabilities, absences] = await Promise.all([
                    backend.getAppointmentsByDoctor(doctorId),
                    backend.getAvailabilitiesByDoctor(doctorId),
                    backend.getAbsencesByDoctor(doctorId)
                ]);

                // First fetch - just store the data
                if (!previousDataRef.current) {
                    previousDataRef.current = { appointments, availabilities, absences };
                    return;
                }

                // Check for changes
                const prev = previousDataRef.current;
                let hasChanges = false;
                let changeMessage = '';

                // Check appointments
                if (appointments.length !== prev.appointments.length) {
                    hasChanges = true;
                    if (appointments.length > prev.appointments.length) {
                        changeMessage = '📅 Nowa wizyta została dodana do harmonogramu';
                    } else {
                        changeMessage = '📅 Wizyta została usunięta z harmonogramu';
                    }
                }

                // Check availabilities
                if (availabilities.length !== prev.availabilities.length) {
                    hasChanges = true;
                    if (availabilities.length > prev.availabilities.length) {
                        changeMessage = '✅ Lekarz dodał nową dostępność';
                    } else {
                        changeMessage = '⚠️ Dostępność lekarza została zmieniona';
                    }
                }

                // Check absences
                if (absences.length !== prev.absences.length) {
                    hasChanges = true;
                    if (absences.length > prev.absences.length) {
                        changeMessage = '🚫 Lekarz dodał nieobecność';
                    }
                }

                // Show notification if changes detected
                if (hasChanges && onUpdate) {
                    onUpdate(changeMessage);
                    // Update the stored data
                    previousDataRef.current = { appointments, availabilities, absences };
                }

            } catch (error) {
                console.error('Error polling for changes:', error);
            }
        };

        // Initial fetch
        pollForChanges();

        // Poll every 10 seconds
        const interval = setInterval(pollForChanges, 10000);

        return () => {
            clearInterval(interval);
            previousDataRef.current = null;
        };
    }, [doctorId, isActive, backend, onUpdate]);

    return null; // This component doesn't render anything
};
