const API_URL = 'http://localhost:3000';

export const getAnimals = async () => {
    const response = await fetch(`${API_URL}/animals`);
    if (!response.ok) throw new Error('Failed to fetch animals');
    return response.json();
};
export const getAnimal = async (id: number) => {
    const response = await fetch(`${API_URL}/animals/${id}`);
    if (!response.ok) throw new Error('Failed to fetch animal');
    return response.json();
};
export const createAnimal = async (animal: Omit<import('../types').Animal, 'id'>) => {
    const response = await fetch(`${API_URL}/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animal),
    });
    if (!response.ok) throw new Error('Failed to create animal');
    return response.json();
};



export const updateAnimal = async (id: number, animal: Partial<import('../types').Animal>) => {
    const response = await fetch(`${API_URL}/animals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animal),
    });
    if (!response.ok) throw new Error('Failed to update animal');
    return response.json();
};
export const deleteAnimal = async (id: number) => {
    const response = await fetch(`${API_URL}/animals/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete animal');
    return response.json();
};
export const getCategories = async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
};

export const createCategory = async (name: string) => {
    const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
};
