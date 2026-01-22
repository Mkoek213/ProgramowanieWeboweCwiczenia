import { useEffect, useState, useMemo } from 'react';
import type { Appointment, Availability, Absence, TimeSlot } from '../models/types';
import {
    DAY_NAMES,
    formatDate,
    getWeekDates,
    CONSULTATION_TYPE_COLORS,
    CONSULTATION_TYPE_LABELS
} from '../models/types';

interface WeeklyCalendarProps {
    doctorId: string;
    appointments: Appointment[];
    availabilities: Availability[];
    absences: Absence[];
    onSlotClick?: (date: string, time: string) => void;
    onAppointmentClick?: (appointment: Appointment) => void;
    startHour?: number;
    endHour?: number;
    visibleHours?: number;
}

export const WeeklyCalendar = ({
    doctorId,
    appointments,
    availabilities,
    absences,
    onSlotClick,
    onAppointmentClick,
    startHour = 8,
    endHour = 20,
    visibleHours = 6
}: WeeklyCalendarProps) => {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
    const [scrollOffset, setScrollOffset] = useState(0);
    const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);

    const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, [startHour, endHour]);

    const visibleTimeSlots = useMemo(() => {
        const slotsPerHour = 2;
        const startIndex = scrollOffset * slotsPerHour;
        const endIndex = startIndex + (visibleHours * slotsPerHour);
        return timeSlots.slice(startIndex, endIndex);
    }, [timeSlots, scrollOffset, visibleHours]);

    const isAbsenceDay = (date: Date): boolean => {
        const dateStr = formatDate(date);
        return absences.some(a => {
            if (a.doctorId !== doctorId) return false;
            return dateStr >= a.startDate && dateStr <= a.endDate;
        });
    };

    const isSlotAvailable = (date: Date, time: string): boolean => {
        const dateStr = formatDate(date);
        const dayOfWeek = date.getDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        for (const av of availabilities) {
            if (av.doctorId !== doctorId) continue;

            if (av.type === 'cyclic') {
                if (!av.startDate || !av.endDate || !av.dayMask || !av.timeRanges) continue;
                if (dateStr < av.startDate || dateStr > av.endDate) continue;
                if (!av.dayMask[dayIndex]) continue;

                for (const range of av.timeRanges) {
                    if (time >= range.from && time < range.to) {
                        return true;
                    }
                }
            } else if (av.type === 'one_time') {
                if (av.date === dateStr && av.slots?.includes(time)) {
                    return true;
                }
            }
        }
        return false;
    };

    const getAppointmentForSlot = (date: Date, time: string): Appointment | undefined => {
        const dateStr = formatDate(date);
        const slotDateTime = `${dateStr} ${time}`;

        return appointments.find(a => {
            if (a.status === 'cancelled') return false;
            const apptDateTime = a.date;

            const apptTime = a.date.split(' ')[1] || '';
            const apptDate = a.date.split(' ')[0] || '';
            if (apptDate !== dateStr) return false;


            if (apptTime === time) return true;


            if (a.duration && a.duration > 1) {
                const apptHour = parseInt(apptTime.split(':')[0]);
                const apptMin = parseInt(apptTime.split(':')[1]);
                const slotHour = parseInt(time.split(':')[0]);
                const slotMin = parseInt(time.split(':')[1]);

                const apptStartMins = apptHour * 60 + apptMin;
                const apptEndMins = apptStartMins + (a.duration * 30);
                const slotMins = slotHour * 60 + slotMin;

                return slotMins >= apptStartMins && slotMins < apptEndMins;
            }

            return false;
        });
    };

    const isPast = (date: Date, time: string): boolean => {
        const now = new Date();
        const slotDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate < now;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return formatDate(date) === formatDate(today);
    };

    const getReservationCount = (date: Date): number => {
        const dateStr = formatDate(date);
        return appointments.filter(a =>
            a.date.startsWith(dateStr) && a.status !== 'cancelled'
        ).length;
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const goToToday = () => {
        setCurrentWeekStart(new Date());
    };

    const scrollUp = () => {
        if (scrollOffset > 0) setScrollOffset(scrollOffset - 1);
    };

    const scrollDown = () => {
        const maxOffset = Math.floor((endHour - startHour) - visibleHours);
        if (scrollOffset < maxOffset) setScrollOffset(scrollOffset + 1);
    };

    const getCurrentTimePosition = (): number | null => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours < startHour + scrollOffset || hours >= startHour + scrollOffset + visibleHours) {
            return null;
        }

        const relativeHour = hours - (startHour + scrollOffset);
        const position = (relativeHour * 60 + minutes) / (visibleHours * 60) * 100;
        return position;
    };

    const currentTimePosition = getCurrentTimePosition();

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {}
            <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                <div className="flex gap-2">
                    <button
                        onClick={goToPreviousWeek}
                        className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                    >
                        ← Poprzedni
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Dziś
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                    >
                        Następny →
                    </button>
                </div>
                <div className="font-bold">
                    {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </div>
            </div>

            {}
            <div className="flex justify-end p-2 bg-gray-50 border-b">
                <button onClick={scrollUp} className="px-2 py-1 text-sm bg-white border rounded mr-2 disabled:opacity-50" disabled={scrollOffset === 0}>
                    ↑ Wcześniej
                </button>
                <button onClick={scrollDown} className="px-2 py-1 text-sm bg-white border rounded disabled:opacity-50" disabled={scrollOffset >= (endHour - startHour) - visibleHours}>
                    ↓ Później
                </button>
            </div>

            {}
            <div className="relative">
                {}
                {currentTimePosition !== null && (
                    <div
                        className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                        style={{ top: `calc(40px + ${currentTimePosition}%)` }}
                    >
                        <div className="absolute -left-1 -top-2 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                )}

                {}
                <div className="grid grid-cols-8 border-b">
                    <div className="p-2 text-center font-bold bg-gray-50 border-r">Godzina</div>
                    {weekDates.map((date, i) => {
                        const dateStr = formatDate(date);
                        const isTodayCol = isToday(date);
                        const isAbsence = isAbsenceDay(date);
                        const resCount = getReservationCount(date);

                        return (
                            <div
                                key={dateStr}
                                className={`p-2 text-center border-r last:border-r-0 ${isTodayCol ? 'bg-blue-100' : isAbsence ? 'bg-red-100' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="font-bold">{DAY_NAMES[i]}</div>
                                <div className="text-sm text-gray-600">{date.getDate()}.{date.getMonth() + 1}</div>
                                <div className="text-xs text-gray-400">Wizyty: {resCount}</div>
                            </div>
                        );
                    })}
                </div>

                {}
                <div className="max-h-96 overflow-hidden">
                    {visibleTimeSlots.map((time, timeIndex) => (
                        <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                            {}
                            <div className="p-2 text-center text-sm font-medium bg-gray-50 border-r">
                                {time}
                            </div>

                            {}
                            {weekDates.map((date) => {
                                const dateStr = formatDate(date);
                                const isTodayCol = isToday(date);
                                const isAbsence = isAbsenceDay(date);
                                const isAvailable = isSlotAvailable(date, time);
                                const appointment = getAppointmentForSlot(date, time);
                                const past = isPast(date, time);

                                let cellClass = 'p-1 border-r last:border-r-0 min-h-[32px] cursor-pointer transition-colors ';

                                if (isAbsence) {
                                    cellClass += 'bg-red-200 cursor-not-allowed ';
                                } else if (appointment) {
                                    const typeColor = appointment.consultationType
                                        ? CONSULTATION_TYPE_COLORS[appointment.consultationType]
                                        : 'bg-blue-400';
                                    cellClass += `${typeColor} text-white text-xs ${past ? 'opacity-50' : ''} `;
                                } else if (past) {
                                    cellClass += 'bg-gray-200 cursor-not-allowed ';
                                } else if (isAvailable) {
                                    cellClass += 'bg-green-200 hover:bg-green-300 border border-green-400 ';
                                } else {
                                    cellClass += 'bg-gray-100 cursor-not-allowed ';
                                }

                                if (isTodayCol && !appointment && !isAbsence) {
                                    cellClass += 'ring-1 ring-blue-300 ring-inset ';
                                }

                                return (
                                    <div
                                        key={`${dateStr}-${time}`}
                                        className={cellClass}
                                        onClick={() => {
                                            if (appointment && onAppointmentClick) {
                                                onAppointmentClick(appointment);
                                            } else if (isAvailable && !past && !isAbsence && onSlotClick) {
                                                onSlotClick(dateStr, time);
                                            }
                                        }}
                                        onMouseEnter={() => appointment && setHoveredAppointment(appointment)}
                                        onMouseLeave={() => setHoveredAppointment(null)}
                                    >
                                        {appointment && (
                                            <div className="truncate text-xs">
                                                {appointment.patientName || 'Wizyta'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {}
            {hoveredAppointment && (
                <div className="absolute bg-white shadow-lg rounded-lg p-4 z-30 border min-w-64" style={{ top: '100px', right: '20px' }}>
                    <h4 className="font-bold mb-2">Szczegóły wizyty</h4>
                    <p><strong>Pacjent:</strong> {hoveredAppointment.patientName || 'Brak danych'}</p>
                    <p><strong>Data:</strong> {hoveredAppointment.date}</p>
                    <p><strong>Typ:</strong> {hoveredAppointment.consultationType ? CONSULTATION_TYPE_LABELS[hoveredAppointment.consultationType] : 'Nie określono'}</p>
                    <p><strong>Czas:</strong> {hoveredAppointment.duration ? hoveredAppointment.duration * 30 : 30} min</p>
                    {hoveredAppointment.notes && <p><strong>Notatki:</strong> {hoveredAppointment.notes}</p>}
                    <p><strong>Status:</strong> {hoveredAppointment.status}</p>
                </div>
            )}

            {}
            <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-200 border border-green-400"></div>
                    <span>Dostępne</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-100 border"></div>
                    <span>Niedostępne</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-200 border"></div>
                    <span>Nieobecność</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-400"></div>
                    <span>Zarezerwowane</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-300"></div>
                    <span>Przeszłe</span>
                </div>
            </div>
        </div>
    );
};
