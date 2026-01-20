import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: ('guest' | 'patient' | 'doctor' | 'admin')[];
    requireAuth?: boolean;
}

/**
 * PrivateRoute component for role-based route protection
 * 
 * Usage:
 * - <PrivateRoute requireAuth> - Requires any logged in user
 * - <PrivateRoute allowedRoles={['admin']}> - Only admin can access
 * - <PrivateRoute allowedRoles={['doctor', 'admin']}> - Doctor or admin
 */
export const PrivateRoute = ({
    children,
    allowedRoles,
    requireAuth = true
}: PrivateRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    // If authentication is required but user is not logged in
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required, check if user has one of them
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role || 'guest';
        if (!allowedRoles.includes(userRole)) {
            // User doesn't have required role - redirect to home
            return <Navigate to="/" replace />;
        }
    }

    // Check if user is banned
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

/**
 * GuestOnlyRoute - Only for guests (not logged in users)
 * Redirects to home if already logged in
 */
export const GuestOnlyRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
