import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { IDataBackend } from '../services/api';
import { JsonServerBackend } from '../services/jsonServerBackend';
import { FirebaseBackend } from '../services/firebaseBackend';

type BackendType = 'json' | 'firebase';

interface BackendContextProps {
    backend: IDataBackend;
    backendType: BackendType;
    switchBackend: (type: BackendType) => void;
}

const BackendContext = createContext<BackendContextProps | undefined>(undefined);

export const BackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [backendType, setBackendType] = useState<BackendType>('json');
    const [backend, setBackend] = useState<IDataBackend>(new JsonServerBackend());

    const switchBackend = (type: BackendType) => {
        setBackendType(type);
        if (type === 'json') {
            setBackend(new JsonServerBackend());
        } else {
            setBackend(new FirebaseBackend());
        }
    };

    return (
        <BackendContext.Provider value={{ backend, backendType, switchBackend }}>
            {children}
        </BackendContext.Provider>
    );
};

export const useBackend = () => {
    const context = useContext(BackendContext);
    if (!context) {
        throw new Error("useBackend must be used within a BackendProvider");
    }
    return context;
};
