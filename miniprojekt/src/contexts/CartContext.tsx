import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Appointment } from '../models/types';
import { useAuth } from './AuthContext';
import { useBackend } from './BackendContext';

interface CartContextProps {
    cart: Appointment[];
    addToCart: (appointment: Appointment) => void;
    removeFromCart: (apptId: string) => void;
    confirmBooking: () => Promise<void>;
    clearCart: () => void;
    isInCart: (date: string, doctorId: string) => boolean;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = 'medapp_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { backend } = useBackend();
    const [cart, setCart] = useState<Appointment[]>([]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const storageKey = `${CART_STORAGE_KEY}_${user.id}`;
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCart(parsed);
                }
            } catch (e) {
                console.error('Error loading cart from storage:', e);
            }
        } else {
            setCart([]);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (isAuthenticated && user && cart.length >= 0) {
            const storageKey = `${CART_STORAGE_KEY}_${user.id}`;
            try {
                localStorage.setItem(storageKey, JSON.stringify(cart));
            } catch (e) {
                console.error('Error saving cart to storage:', e);
            }
        }
    }, [cart, isAuthenticated, user?.id]);

    const addToCart = (appointment: Appointment) => {
        if (!user) return;

        const apptWithPatient: Appointment = {
            ...appointment,
            patientId: String(user.id)
        };

        const isDuplicate = cart.some(
            a => a.date === apptWithPatient.date && a.doctorId === apptWithPatient.doctorId
        );

        if (isDuplicate) {
            alert('Ta wizyta jest już w koszyku!');
            return;
        }

        setCart([...cart, apptWithPatient]);
    };

    const removeFromCart = (apptId: string) => {
        setCart(cart.filter(a => a.id !== apptId));
    };

    const clearCart = () => {
        setCart([]);
        if (user) {
            const storageKey = `${CART_STORAGE_KEY}_${user.id}`;
            localStorage.removeItem(storageKey);
        }
    };

    const confirmBooking = async () => {
        if (!user) {
            console.error('No user logged in, cannot confirm booking');
            return;
        }

        for (const appt of cart) {
            const confirmedAppt: Appointment = {
                ...appt,
                status: 'booked',
                patientId: String(user.id), 
            };

            try {
                console.log('Saving appointment:', confirmedAppt);
                await backend.addAppointment(confirmedAppt);
                console.log('Appointment saved successfully');
            } catch (error) {
                console.error('Error saving appointment:', error);

            }
        }
        clearCart();
    };

    const isInCart = (date: string, doctorId: string): boolean => {
        return cart.some(a => a.date === date && a.doctorId === doctorId);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            confirmBooking,
            isInCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
