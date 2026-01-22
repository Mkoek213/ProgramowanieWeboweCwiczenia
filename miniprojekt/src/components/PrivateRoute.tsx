import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: ('guest' | 'patient' | 'doctor' | 'admin')[];
    requireAuth?: boolean;
}


export const PrivateRoute = ({
    children,
    allowedRoles,
    requireAuth = true
}: PrivateRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role || 'guest';
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    if (user?.isBanned) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Konto zablokowane</h2>
                <p className="text-gray-600">Twoje konto zostało zablokowane przez administratora.</p>
                <p className="text-gray-600">Skontaktuj się z supportem w celu wyjaśnienia.</p>
            </div>
        );
    }

    return <>{children}</>;
};


export const GuestOnlyRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
