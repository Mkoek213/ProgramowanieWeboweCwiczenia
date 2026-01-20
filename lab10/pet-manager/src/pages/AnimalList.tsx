import React, { useState, useMemo } from 'react';
import type { Animal, Category } from '../types';
import { AnimalCard } from '../components/AnimalCard';
import './AnimalList.css';

interface AnimalListProps {
    animals: Animal[];
    categories: Category[];
    onToggleFavorite: (animal: Animal) => void;
}




export const AnimalList: React.FC<AnimalListProps> = ({ animals, categories, onToggleFavorite }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const category = e.target.value;
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };



    const filteredAnimals = useMemo(() => {
        let result = animals;
        if (selectedCategories.length > 0) {
            result = result.filter(a => selectedCategories.includes(a.category));
        }
        if (sortOrder) {
            result = [...result].sort((a, b) => {
                return sortOrder === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            });
        }
        return result;
    }, [animals, selectedCategories, sortOrder]);


    return (
        <div className="animal-list-page">
            <div className="filters">
                <h3>Filtry</h3>
                <div className="category-filters">
                    {categories.map(cat => (
                        <label key={cat.id}>
                            <input
                                type="checkbox"
                                value={cat.name}
                                checked={selectedCategories.includes(cat.name)}
                                onChange={handleCategoryChange}
                            />
                            {cat.name}
                        </label>
                    ))}
                </div>
                <div className="sort">
                    <label>Sortuj: </label>
                    <select onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc' | null)}>
                        <option value="">Brak</option>
                        <option value="asc">A-Z</option>
                        <option value="desc">Z-A</option>
                    </select>
                </div>
            </div>



            <div className="animals-grid">
                {filteredAnimals.map(animal => (
                    <AnimalCard
                        key={animal.id}
                        animal={animal}
                        onFavoriteToggle={onToggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
};
