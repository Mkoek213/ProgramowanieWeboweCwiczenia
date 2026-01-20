import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Animal } from '../types';
import * as api from '../services/api';
import './AnimalDetails.css';

interface AnimalDetailsProps {
    onDelete: (id: number) => Promise<void>;
}




export const AnimalDetails: React.FC<AnimalDetailsProps> = ({ onDelete }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            api.getAnimal(Number(id))
                .then(setAnimal)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleDeleteClick = async () => {
        if (animal) {
            await onDelete(animal.id);
            navigate('/');
        }
    };



    if (loading) return <div>Loading...</div>;

    if (!animal) return <div>Animal not found</div>;

    return (
        <div className="animal-details">
            
            <h1>{animal.name}</h1>
            <div className="details-card">
                <p><strong>Kategoria:</strong> {animal.category}</p>
                <p><strong>Wiek:</strong> {animal.age}</p>
                <p><strong>Waga:</strong> {animal.weight}</p>
                <p><strong>Status:</strong> {animal.isFavorite ? 'Ulubiony' : 'Zwykły'}</p>
            </div>
            <div className="actions">
                <Link to={`/edit/${animal.id}`} className="btn btn-edit">Edytuj</Link>
                <button onClick={handleDeleteClick} className="btn btn-delete">Usuń</button>
            </div>
        </div>
    );
};
