import type { Doctor, Appointment, User, Review, Availability, Absence } from "../models/types";

// Interface for backend
export interface IDataBackend {

    // doctors
    getDoctors(): Promise<Doctor[]>;
    getDoctorById(id: string): Promise<Doctor | undefined>;
    addDoctor(doc: Doctor): Promise<void>;
    updateDoctor(doc: Doctor): Promise<void>;
    deleteDoctor(id: string): Promise<void>;

    // appointments
    getAppointments(): Promise<Appointment[]>;
    getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
    getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
    addAppointment(appt: Appointment): Promise<void>;
    updateAppointment(appt: Appointment): Promise<void>;
    cancelAppointment(id: string, reason?: string): Promise<void>;

    // reviews
    addReview(doctorId: string, review: Review): Promise<void>;

    // users
    getUsers(): Promise<User[]>;

    // availabilities
    getAvailabilities(): Promise<Availability[]>;
    getAvailabilitiesByDoctor(doctorId: string): Promise<Availability[]>;
    addAvailability(av: Availability): Promise<void>;
    updateAvailability(av: Availability): Promise<void>;
    deleteAvailability(id: string): Promise<void>;

    // absences
    getAbsences(): Promise<Absence[]>;
    getAbsencesByDoctor(doctorId: string): Promise<Absence[]>;
    addAbsence(absence: Absence): Promise<void>;
    deleteAbsence(id: string): Promise<void>;
}
