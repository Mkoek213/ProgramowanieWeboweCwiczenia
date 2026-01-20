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
    const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('LOCAL');

    // Init from storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                setUser(JSON.parse(stored));
                setPersistenceMode('LOCAL');
                return;
            }
            const storedSession = sessionStorage.getItem('currentUser');
            if (storedSession) {
                setUser(JSON.parse(storedSession));
                setPersistenceMode('SESSION');
            }
        } catch (e) {
            console.error("Auth init error", e);
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            authService.clearToken();
        }
    }, []);

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
