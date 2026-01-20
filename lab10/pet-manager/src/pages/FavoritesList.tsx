import React from 'react';
import type { Animal } from '../types';
import { AnimalCard } from '../components/AnimalCard';
import './AnimalList.css';

interface FavoritesListProps {
    animals: Animal[];
    onToggleFavorite: (animal: Animal) => void;
}
export const FavoritesList: React.FC<FavoritesListProps> = ({ animals, onToggleFavorite }) => {
    const favorites = animals.filter(a => a.isFavorite);
    return (
        <div className="animal-list-page">
            <h2>Ulubione zwierzęta</h2>
            <div className="animals-grid">
                {favorites.length === 0 ? <p>Brak ulubionych zwierząt.</p> : null}
                {favorites.map(animal => (
                    <AnimalCard
                        key={animal.id}
                        animal={animal}
                        onFavoriteToggle={onToggleFavorite}
                        isFavoriteView={true}
                    />
                ))}
            </div>
        </div>
    );
};
