import React from 'react';
import { Link } from 'react-router-dom';
import type { Animal } from '../types';
import './AnimalCard.css';


interface AnimalCardProps {
    animal: Animal;
    onFavoriteToggle: (animal: Animal) => void;
    isFavoriteView?: boolean;
}



export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onFavoriteToggle, isFavoriteView = false }) => {
    return (
        <div className={`animal-card ${animal.isFavorite ? 'favorite' : ''}`}>
            <h3><Link to={`/details/${animal.id}`}>{animal.name}</Link></h3>
            <p>Kategoria: {animal.category}</p>
            <p>Wiek: {animal.age}</p>

            <div className="card-actions">
                {isFavoriteView ? (
                    <button onClick={() => onFavoriteToggle(animal)} className="btn-delete-fav">
                        Usuń z ulubionych
                    </button>
                ) : (
                    <button
                        onClick={() => onFavoriteToggle(animal)}
                        className={`btn-favorite ${animal.isFavorite ? 'active' : ''}`}
                    >
                        {animal.isFavorite ? 'Zwykły' : 'Ulubiony'}
                    </button>
                )}
            </div>
        </div>
    );
};
