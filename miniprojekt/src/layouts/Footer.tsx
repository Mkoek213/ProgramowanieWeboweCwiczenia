import { useEffect, useState } from 'react';
import { useBackend } from '../contexts/BackendContext';
import { useAuth } from '../contexts/AuthContext';

export const Footer = () => {
    const { backend, backendType } = useBackend();
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState({ doctors: 0, appointments: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [docs, appts] = await Promise.all([
                    backend.getDoctors(),
                    backend.getAppointments()
                ]);
                setStats({
                    doctors: docs.length,
                    appointments: appts.filter(a => a.status === 'booked').length
                });
            } catch { }
        };
        fetchStats();
    }, [backend]);

    return (
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>{stats.doctors} lekarzy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{stats.appointments} aktywnych wizyt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>Backend: {backendType.toUpperCase()}</span>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    <span className="font-medium">MedApp</span> • PLab 10-12 • {new Date().getFullYear()}
                </div>
            </div>
        </footer>
    );
};
