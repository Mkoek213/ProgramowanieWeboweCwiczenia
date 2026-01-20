import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api';
import type { Category } from '../types';
import './AnimalForm.css';

interface AnimalFormProps {
    categories: Category[];
    onSave: () => Promise<void>;
    refreshCategories: () => Promise<void>;
}



export const AnimalForm: React.FC<AnimalFormProps> = ({ categories, onSave, refreshCategories }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        age: '',
        weight: '',
        isFavorite: false
    });

    const [newCategory, setNewCategory] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    useEffect(() => {
        if (id) {
            api.getAnimal(Number(id)).then(animal => {
                setFormData({
                    name: animal.name,
                    category: animal.category,
                    age: animal.age.toString(),
                    weight: animal.weight.toString(),
                    isFavorite: animal.isFavorite
                });
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.age || !formData.weight) {
            alert("Wypełnij wszystkie pola");
            return;
        }

        let finalCategory = formData.category;
        if (showNewCategoryInput && newCategory) {
            await api.createCategory(newCategory); // Add to DB
            await refreshCategories();
            finalCategory = newCategory;
        } else if (!finalCategory) {
            alert("Wybierz kategorię");
            return;
        }

        const animalData = {
            name: formData.name,
            category: finalCategory,
            age: Number(formData.age),
            weight: Number(formData.weight),
            isFavorite: formData.isFavorite
        };


        try {
            if (id) {
                await api.updateAnimal(Number(id), animalData);
            } else {
                await api.createAnimal(animalData);
            }
            await onSave();
            navigate('/');
        } catch (error) {
            console.error("Error saving animal", error);
        }
    };



    return (
        <div className="animal-form-page">
            <h2>{id ? 'Edytuj Zwierzę' : 'Nowe Zwierzę'}</h2>
            <form onSubmit={handleSubmit} className="animal-form">
                <div className="form-group">
                    <label>Imię</label>
                    <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Kategoria</label>
                    {!showNewCategoryInput ? (
                        <div className="select-container">
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Wybierz...</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setShowNewCategoryInput(true)}>Nowa</button>
                        </div>
                    ) : (
                        <div className="new-cat-container">
                            <input
                                placeholder="Nowa kategoria"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            />
                            <button type="button" onClick={() => setShowNewCategoryInput(false)}>Anuluj</button>
                        </div>
                    )}
                </div>



                <div className="form-group">
                    <label>Wiek</label>
                    <input
                        type="number"
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                        required
                        min="0"
                    />

                </div>

                <div className="form-group">
                    <label>Waga</label>
                    <input
                        type="number"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        required
                        min="0"
                    />
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.isFavorite}
                            onChange={e => setFormData({ ...formData, isFavorite: e.target.checked })}
                        />
                        Ulubiony
                    </label>
                </div>



                <button type="submit" className="btn btn-submit">{id ? 'Zapisz' : 'Dodaj'}</button>
            </form>
        </div>
    );
};
