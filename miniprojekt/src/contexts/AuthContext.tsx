import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../models/types';
import { authService } from '../services/authService';

export type PersistenceMode = 'LOCAL' | 'SESSION' | 'NONE';

interface AuthContextProps {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    persistenceMode: PersistenceMode;
    setPersistenceMode: (mode: PersistenceMode) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [persistenceMode, setPersistenceModeState] = useState<PersistenceMode>('LOCAL');

    // Helper to persist mode
    const persistMode = (mode: PersistenceMode) => {
        localStorage.setItem('authPersistenceMode', mode);
    };

    // On mount, load persistence mode and user from correct storage
    useEffect(() => {
        try {
            const savedMode = localStorage.getItem('authPersistenceMode') as PersistenceMode | null;
            let mode: PersistenceMode = savedMode || 'LOCAL';
            setPersistenceModeState(mode);

            let stored: string | null = null;
            if (mode === 'LOCAL') {
                stored = localStorage.getItem('currentUser');
            } else if (mode === 'SESSION') {
                stored = sessionStorage.getItem('currentUser');
            }
            if (stored) {
                setUser(JSON.parse(stored));
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error("Auth init error", e);
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            authService.clearToken();
        }
    }, []);

    // Custom setter to persist mode and move user data if needed
    const setPersistenceMode = (mode: PersistenceMode) => {
        if (mode === persistenceMode) return;
        persistMode(mode);
        setPersistenceModeState(mode);
        // Move user data to new storage
        if (user) {
            if (mode === 'LOCAL') {
                localStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.removeItem('currentUser');
            } else if (mode === 'SESSION') {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.removeItem('currentUser');
            } else {
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
            }
        } else {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
        }
    };

    const login = (newUser: User) => {
        setUser(newUser);
        if (persistenceMode === 'LOCAL') {
            localStorage.setItem('currentUser', JSON.stringify(newUser));
        } else if (persistenceMode === 'SESSION') {
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        }
        // NONE: do nothing
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        // Clear JWT token
        authService.clearToken();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, persistenceMode, setPersistenceMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
