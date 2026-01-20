import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useBackend } from './BackendContext';
import { useAuth } from './AuthContext';
import type { Appointment, Availability, Absence } from '../models/types';

interface NotificationContextProps {
    // Schedule data that updates in real-time
    scheduleUpdates: ScheduleUpdate[];
    hasNewUpdates: boolean;
    clearUpdates: () => void;
    lastUpdateTime: Date | null;
}

interface ScheduleUpdate {
    id: string;
    type: 'new_slot' | 'cancelled' | 'absence' | 'availability_change';
    doctorId: string;
    doctorName?: string;
    message: string;
    timestamp: Date;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const POLL_INTERVAL = 30000; // 30 seconds

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { backend } = useBackend();
    const { user, isAuthenticated } = useAuth();

    const [scheduleUpdates, setScheduleUpdates] = useState<ScheduleUpdate[]>([]);
    const [hasNewUpdates, setHasNewUpdates] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

    // Store previous state for comparison
    const [prevAppointments, setPrevAppointments] = useState<Appointment[]>([]);
    const [prevAvailabilities, setPrevAvailabilities] = useState<Availability[]>([]);
    const [prevAbsences, setPrevAbsences] = useState<Absence[]>([]);

    const checkForUpdates = useCallback(async () => {
        if (!isAuthenticated || user?.role !== 'patient') return;

        try {
            const [appointments, availabilities, absences] = await Promise.all([
                backend.getAppointments(),
                backend.getAvailabilities(),
                backend.getAbsences()
            ]);

            const newUpdates: ScheduleUpdate[] = [];

            // Check for new absences (doctors becoming unavailable)
            for (const absence of absences) {
                const wasPresent = prevAbsences.some(a => a.id === absence.id);
                if (!wasPresent) {
                    newUpdates.push({
                        id: `absence-${absence.id}`,
                        type: 'absence',
                        doctorId: absence.doctorId,
                        message: `Lekarz zgłosił nieobecność: ${absence.startDate} - ${absence.endDate}`,
                        timestamp: new Date()
                    });
                }
            }

            // Check for cancelled appointments (that were previously booked)
            for (const appt of appointments) {
                const prevAppt = prevAppointments.find(a => a.id === appt.id);
                if (prevAppt && prevAppt.status !== 'cancelled' && appt.status === 'cancelled') {
                    if (appt.patientId === user?.id) {
                        newUpdates.push({
                            id: `cancelled-${appt.id}`,
                            type: 'cancelled',
                            doctorId: appt.doctorId,
                            message: `Twoja wizyta ${appt.date} została odwołana`,
                            timestamp: new Date()
                        });
                    }
                }
            }

            // Check for new availability slots
            for (const av of availabilities) {
                const wasPresent = prevAvailabilities.some(a => a.id === av.id);
                if (!wasPresent) {
                    newUpdates.push({
                        id: `availability-${av.id}`,
                        type: 'availability_change',
                        doctorId: av.doctorId,
                        message: `Lekarz dodał nowe terminy`,
                        timestamp: new Date()
                    });
                }
            }

            if (newUpdates.length > 0) {
                setScheduleUpdates(prev => [...newUpdates, ...prev].slice(0, 20)); // Keep last 20
                setHasNewUpdates(true);
            }

            // Update previous state
            setPrevAppointments(appointments);
            setPrevAvailabilities(availabilities);
            setPrevAbsences(absences);
            setLastUpdateTime(new Date());

        } catch (e) {
            console.error('Error checking for updates:', e);
        }
    }, [backend, isAuthenticated, user, prevAppointments, prevAvailabilities, prevAbsences]);

    // Initial load
    useEffect(() => {
        if (isAuthenticated && user?.role === 'patient') {
            checkForUpdates();
        }
    }, [isAuthenticated, user?.id]);

    // Polling
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'patient') return;

        const interval = setInterval(checkForUpdates, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isAuthenticated, user?.role, checkForUpdates]);

    const clearUpdates = () => {
        setHasNewUpdates(false);
    };

    return (
        <NotificationContext.Provider value={{
            scheduleUpdates,
            hasNewUpdates,
            clearUpdates,
            lastUpdateTime
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
