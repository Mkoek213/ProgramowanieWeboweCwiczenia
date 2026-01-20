import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { NotificationToast } from '../components/NotificationToast';

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
                <Footer />
            </div>
            <NotificationToast />
        </div>
    );
};
