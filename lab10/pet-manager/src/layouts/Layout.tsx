import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import './Layout.css';


interface LayoutProps {
    children: React.ReactNode;
    totalAnimals: number;
    favoriteAnimals: number;
}



export const Layout: React.FC<LayoutProps> = ({ children, totalAnimals, favoriteAnimals }) => {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
            <Footer totalAnimals={totalAnimals} favoriteAnimals={favoriteAnimals} />
        </div>
    );
};
