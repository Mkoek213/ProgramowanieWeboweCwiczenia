// ==================== USER ====================
export interface User {
    id: string;
    email: string;
    password?: string;  
    role: 'guest' | 'patient' | 'doctor' | 'admin';
    name?: string;
    isBanned?: boolean;
    attendedDoctors?: string[]; 
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
    schedule: string[]; 
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
    | 'first_visit'   
    | 'follow_up'        
    | 'chronic'         
    | 'prescription'    
    | 'consultation'    
    | 'other';          

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
    startTime: string; 
    endTime: string;    
    date: string;      
    isAvailable: boolean;
    appointmentId?: string; 
}

// ==================== AVAILABILITY ====================
export interface Availability {
    id: string;
    doctorId: string;
    type: 'cyclic' | 'one_time';

    // For cyclic availability
    startDate?: string;    
    endDate?: string;      
    dayMask?: boolean[];    
    timeRanges?: TimeRange[];

    // For one-time availability
    date?: string;        
    slots?: string[];    
}

export interface TimeRange {
    from: string; 
    to: string;   
}

// ==================== ABSENCE ====================
export interface Absence {
    id: string;
    doctorId: string;
    startDate: string;    
    endDate: string;     
    reason?: string;
    affectedAppointments?: string[]; 
}

// ==================== APPOINTMENT (ENHANCED) ====================
export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    date: string;  
    duration: number;      
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
    type: string;     
    size: number;      
    uploadedAt: string;
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
