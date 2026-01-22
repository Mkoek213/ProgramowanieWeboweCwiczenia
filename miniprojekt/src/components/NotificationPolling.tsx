import { useEffect, useRef } from 'react';
import { useBackend } from '../contexts/BackendContext';
import type { Appointment, Availability, Absence } from '../models/types';

interface NotificationPollingProps {
    doctorId: string;
    isActive: boolean;  
    onUpdate?: (message: string) => void;  
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

                if (!previousDataRef.current) {
                    previousDataRef.current = { appointments, availabilities, absences };
                    return;
                }

                const prev = previousDataRef.current;
                let hasChanges = false;
                let changeMessage = '';

                if (appointments.length !== prev.appointments.length) {
                    hasChanges = true;
                    if (appointments.length > prev.appointments.length) {
                        changeMessage = 'Nowa wizyta została dodana do harmonogramu';
                    } else {
                        changeMessage = 'Wizyta została usunięta z harmonogramu';
                    }
                }

                if (availabilities.length !== prev.availabilities.length) {
                    hasChanges = true;
                    if (availabilities.length > prev.availabilities.length) {
                        changeMessage = 'Lekarz dodał nową dostępność';
                    } else {
                        changeMessage = 'Dostępność lekarza została zmieniona';
                    }
                }

                if (absences.length !== prev.absences.length) {
                    hasChanges = true;
                    if (absences.length > prev.absences.length) {
                        changeMessage = 'Lekarz dodał nieobecność';
                    }
                }

                if (hasChanges && onUpdate) {
                    onUpdate(changeMessage);
                    previousDataRef.current = { appointments, availabilities, absences };
                }

            } catch (error) {
                console.error('Error polling for changes:', error);
            }
        };

        pollForChanges();

        const interval = setInterval(pollForChanges, 10000);

        return () => {
            clearInterval(interval);
            previousDataRef.current = null;
        };
    }, [doctorId, isActive, backend, onUpdate]);

    return null; 
};
