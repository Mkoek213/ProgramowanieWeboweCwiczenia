import type { IDataBackend } from './api';
import type { Doctor, Appointment, Review, User, Availability, Absence } from '../models/types';

// TODO: Import firebase config here
// import { initializeApp } from "firebase/app";
// ...

export class FirebaseBackend implements IDataBackend {

    constructor() {
        console.log("Firebase Backend initialized (not connected)");
    }

    // ==================== DOCTORS ====================
    async getDoctors(): Promise<Doctor[]> {
        console.log("Firebase: getDoctors");
        return [];
    }

    async getDoctorById(id: string): Promise<Doctor | undefined> {
        console.log("Firebase: getDoctorById", id);
        return undefined;
    }

    async addDoctor(doc: Doctor): Promise<void> {
        console.log("Firebase: addDoctor", doc);
    }

    async updateDoctor(doc: Doctor): Promise<void> {
        console.log("Firebase: updateDoctor", doc);
    }

    async deleteDoctor(id: string): Promise<void> {
        console.log("Firebase: deleteDoctor", id);
    }

    // ==================== APPOINTMENTS ====================
    async getAppointments(): Promise<Appointment[]> {
        console.log("Firebase: getAppointments");
        return [];
    }

    async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
        console.log("Firebase: getAppointmentsByDoctor", doctorId);
        return [];
    }

    async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
        console.log("Firebase: getAppointmentsByPatient", patientId);
        return [];
    }

    async addAppointment(appt: Appointment): Promise<void> {
        console.log("Firebase: addAppointment", appt);
    }

    async updateAppointment(appt: Appointment): Promise<void> {
        console.log("Firebase: updateAppointment", appt);
    }

    async cancelAppointment(id: string, reason?: string): Promise<void> {
        console.log("Firebase: cancelAppointment", id, reason);
    }

    // ==================== REVIEWS ====================
    async addReview(doctorId: string, review: Review): Promise<void> {
        console.log("Firebase: addReview", doctorId, review);
    }

    // ==================== USERS ====================
    async getUsers(): Promise<User[]> {
        console.log("Firebase: getUsers");
        return [];
    }

    // ==================== AVAILABILITIES ====================
    async getAvailabilities(): Promise<Availability[]> {
        console.log("Firebase: getAvailabilities");
        return [];
    }

    async getAvailabilitiesByDoctor(doctorId: string): Promise<Availability[]> {
        console.log("Firebase: getAvailabilitiesByDoctor", doctorId);
        return [];
    }

    async addAvailability(av: Availability): Promise<void> {
        console.log("Firebase: addAvailability", av);
    }

    async updateAvailability(av: Availability): Promise<void> {
        console.log("Firebase: updateAvailability", av);
    }

    async deleteAvailability(id: string): Promise<void> {
        console.log("Firebase: deleteAvailability", id);
    }

    // ==================== ABSENCES ====================
    async getAbsences(): Promise<Absence[]> {
        console.log("Firebase: getAbsences");
        return [];
    }

    async getAbsencesByDoctor(doctorId: string): Promise<Absence[]> {
        console.log("Firebase: getAbsencesByDoctor", doctorId);
        return [];
    }

    async addAbsence(absence: Absence): Promise<void> {
        console.log("Firebase: addAbsence", absence);
    }

    async deleteAbsence(id: string): Promise<void> {
        console.log("Firebase: deleteAbsence", id);
    }
}
