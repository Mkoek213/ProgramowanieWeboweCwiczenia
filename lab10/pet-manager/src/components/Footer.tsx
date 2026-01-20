import React from 'react';
import './Footer.css';

interface FooterProps {
    totalAnimals: number;
    favoriteAnimals: number;
}

export const Footer: React.FC<FooterProps> = ({ totalAnimals, favoriteAnimals }) => {
    return (
        <footer className="footer">
            <p>Wszystkie zwierzęta: <strong>{totalAnimals}</strong></p>
            <p>Ulubione: <strong>{favoriteAnimals}</strong></p>
        </footer>
    );
};
