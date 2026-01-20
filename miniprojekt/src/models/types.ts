// ==================== USER ====================
export interface User {
    id: string;
    email: string;
    password?: string;  // For authentication (simple hash)
    role: 'guest' | 'patient' | 'doctor' | 'admin';
    name?: string;
    isBanned?: boolean;
    attendedDoctors?: string[];  // IDs of doctors the patient has visited (for review restriction)
}

// ==================== DOCTOR ====================
export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    price: number;
    description: string;
    imageUrl?: string;
    reviews: Review[];
    schedule: string[]; // Legacy: np. "2023-10-10 10:00"
}

export interface Review {
    id: string;
    author: string;
    rating: number;
    text: string;
    response?: string;
}

// ==================== CONSULTATION TYPES ====================
export type ConsultationType =
    | 'first_visit'      // Pierwsza wizyta
    | 'follow_up'        // Wizyta kontrolna
    | 'chronic'          // Choroba przewlekła
    | 'prescription'     // Recepta
    | 'consultation'     // Konsultacja
    | 'other';           // Inne

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
    first_visit: 'Pierwsza wizyta',
    follow_up: 'Wizyta kontrolna',
    chronic: 'Choroba przewlekła',
    prescription: 'Recepta',
    consultation: 'Konsultacja',
    other: 'Inne'
};

export const CONSULTATION_TYPE_COLORS: Record<ConsultationType, string> = {
    first_visit: 'bg-blue-500',
    follow_up: 'bg-green-500',
    chronic: 'bg-purple-500',
    prescription: 'bg-yellow-500',
    consultation: 'bg-cyan-500',
    other: 'bg-gray-500'
};

// ==================== TIME SLOT ====================
export interface TimeSlot {
    startTime: string;  // "HH:MM" format
    endTime: string;    // "HH:MM" format (startTime + 30 min)
    date: string;       // "YYYY-MM-DD" format
    isAvailable: boolean;
    appointmentId?: string; // If booked
}

// ==================== AVAILABILITY ====================
export interface Availability {
    id: string;
    doctorId: string;
    type: 'cyclic' | 'one_time';

    // For cyclic availability
    startDate?: string;     // "YYYY-MM-DD"
    endDate?: string;       // "YYYY-MM-DD"
    dayMask?: boolean[];    // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    timeRanges?: TimeRange[];

    // For one-time availability
    date?: string;          // "YYYY-MM-DD"
    slots?: string[];       // ["HH:MM", "HH:MM", ...]
}

export interface TimeRange {
    from: string;  // "HH:MM"
    to: string;    // "HH:MM"
}

// ==================== ABSENCE ====================
export interface Absence {
    id: string;
    doctorId: string;
    startDate: string;      // "YYYY-MM-DD"
    endDate: string;        // "YYYY-MM-DD"
    reason?: string;
    affectedAppointments?: string[]; // IDs of appointments that were cancelled
}

// ==================== APPOINTMENT (ENHANCED) ====================
export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    date: string;           // "YYYY-MM-DD HH:MM"
    duration: number;       // Number of 0.5h slots (default: 1)
    status: 'pending' | 'booked' | 'completed' | 'cancelled';

    // Consultation details
    consultationType?: ConsultationType;

    // Patient details (collected at booking)
    patientName?: string;
    patientGender?: 'male' | 'female' | 'other';
    patientAge?: number;

    // Additional info
    notes?: string;
    documents?: DocumentAttachment[];

    // Cancellation info
    cancelledAt?: string;
    cancelReason?: string;
}

export interface DocumentAttachment {
    id: string;
    name: string;
    type: string;       // MIME type
    size: number;       // bytes
    uploadedAt: string;
    // In real app, would have URL or base64 data
}

// ==================== HELPER FUNCTIONS ====================
export function generateTimeSlots(date: string, startHour: number, endHour: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endMinute = minute + 30;
            const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
            const endMinuteAdjusted = endMinute >= 60 ? 0 : endMinute;
            const endTime = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinuteAdjusted.toString().padStart(2, '0')}`;

            slots.push({
                startTime,
                endTime,
                date,
                isAvailable: true
            });
        }
    }
    return slots;
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getWeekDates(baseDate: Date): Date[] {
    const dates: Date[] = [];
    const dayOfWeek = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }
    return dates;
}

export const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
export const DAY_NAMES_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
