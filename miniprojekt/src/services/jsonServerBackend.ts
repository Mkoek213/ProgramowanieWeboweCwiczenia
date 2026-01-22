import type { IDataBackend } from './api';
import type { Doctor, Appointment, Review, User, Availability, Absence } from '../models/types';
import { authService } from './authService';

export class JsonServerBackend implements IDataBackend {
    private baseUrl = 'http://localhost:3000';

    constructor() {
        console.log("JSON Server Backend initialized");
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await authService.authFetch(`${this.baseUrl}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Request failed');
        }

        return response.json();
    }

    // ==================== DOCTORS ====================
    async getDoctors(): Promise<Doctor[]> {
        return this.request<Doctor[]>('/doctors');
    }

    async getDoctorById(id: string): Promise<Doctor | undefined> {
        try {
            return await this.request<Doctor>(`/doctors/${id}`);
        } catch {
            return undefined;
        }
    }

    async addDoctor(doc: Doctor): Promise<void> {
        await this.request('/doctors', {
            method: 'POST',
            body: JSON.stringify(doc),
        });
    }

    async updateDoctor(doc: Doctor): Promise<void> {
        await this.request(`/doctors/${doc.id}`, {
            method: 'PUT',
            body: JSON.stringify(doc),
        });
    }

    async deleteDoctor(id: string): Promise<void> {
        await this.request(`/doctors/${id}`, {
            method: 'DELETE',
        });
    }

    // ==================== APPOINTMENTS ====================
    async getAppointments(): Promise<Appointment[]> {
        return this.request<Appointment[]>('/appointments');
    }

    async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
        return this.request<Appointment[]>(`/appointments?doctorId=${doctorId}`);
    }

    async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
        return this.request<Appointment[]>(`/appointments?patientId=${patientId}`);
    }

    async addAppointment(appt: Appointment): Promise<void> {
        await this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify(appt),
        });
    }

    async updateAppointment(appt: Appointment): Promise<void> {
        await this.request(`/appointments/${appt.id}`, {
            method: 'PATCH',
            body: JSON.stringify(appt),
        });
    }

    async cancelAppointment(id: string, reason?: string): Promise<void> {
        await this.request(`/appointments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelReason: reason,
            }),
        });
    }

    // ==================== REVIEWS ====================
    async addReview(doctorId: string, review: Review): Promise<void> {
        const doctor = await this.getDoctorById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        doctor.reviews.push(review);

        await this.updateDoctor(doctor);
    }

    // ==================== USERS ====================
    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users');
    }

    // ==================== AVAILABILITIES ====================
    async getAvailabilities(): Promise<Availability[]> {
        return this.request<Availability[]>('/availabilities');
    }

    async getAvailabilitiesByDoctor(doctorId: string): Promise<Availability[]> {
        return this.request<Availability[]>(`/availabilities?doctorId=${doctorId}`);
    }

    async addAvailability(av: Availability): Promise<void> {
        await this.request('/availabilities', {
            method: 'POST',
            body: JSON.stringify(av),
        });
    }

    async updateAvailability(av: Availability): Promise<void> {
        await this.request(`/availabilities/${av.id}`, {
            method: 'PUT',
            body: JSON.stringify(av),
        });
    }

    async deleteAvailability(id: string): Promise<void> {
        await this.request(`/availabilities/${id}`, {
            method: 'DELETE',
        });
    }

    // ==================== ABSENCES ====================
    async getAbsences(): Promise<Absence[]> {
        return this.request<Absence[]>('/absences');
    }

    async getAbsencesByDoctor(doctorId: string): Promise<Absence[]> {
        return this.request<Absence[]>(`/absences?doctorId=${doctorId}`);
    }

    async addAbsence(absence: Absence): Promise<void> {
        await this.request('/absences', {
            method: 'POST',
            body: JSON.stringify(absence),
        });
    }

    async deleteAbsence(id: string): Promise<void> {
        await this.request(`/absences/${id}`, {
            method: 'DELETE',
        });
    }
}
