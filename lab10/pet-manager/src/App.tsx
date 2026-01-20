import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from './layouts/Layout';
import { AnimalList } from './pages/AnimalList';
import { AnimalForm } from './pages/AnimalForm';
import { FavoritesList } from './pages/FavoritesList';
import { AnimalDetails } from './pages/AnimalDetails';
import * as api from './services/api';
import type { Animal, Category } from './types';

function App() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchData = async () => {
    try {
      const [animalsData, categoriesData] = await Promise.all([
        api.getAnimals(),
        api.getCategories()
      ]);
      setAnimals(animalsData);
      setCategories(categoriesData);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFavorite = async (animal: Animal) => {
    const updatedAnimal = { ...animal, isFavorite: !animal.isFavorite };
    try {
      await api.updateAnimal(animal.id, { isFavorite: updatedAnimal.isFavorite });
      setAnimals(prev => prev.map(a => a.id === animal.id ? updatedAnimal : a));
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteAnimal(id);
      setAnimals(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  const total = animals.length;
  const favorites = animals.filter(a => a.isFavorite).length;

  return (
    <BrowserRouter>
      <Layout totalAnimals={total} favoriteAnimals={favorites}>
        <Routes>
          <Route index element={
            <AnimalList
              animals={animals}
              categories={categories}
              onToggleFavorite={handleToggleFavorite}
            />
          } />
          <Route path="add" element={
            <AnimalForm
              categories={categories}
              onSave={handleRefresh}
              refreshCategories={handleRefresh}
            />
          } />
          
          <Route path="edit/:id" element={
            <AnimalForm
              categories={categories}
              onSave={handleRefresh}
              refreshCategories={handleRefresh}
            />

          } />
          <Route path="details/:id" element={
            <AnimalDetails
              onDelete={handleDelete}
            />

          } />
          <Route path="favorites" element={
            <FavoritesList
              animals={animals}
              onToggleFavorite={handleToggleFavorite}
            />
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
