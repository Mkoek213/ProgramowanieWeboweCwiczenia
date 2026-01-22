import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../contexts/BackendContext';
import type { Review, Appointment } from '../models/types';

interface AddReviewProps {
    doctorId: string;
    onAdded: () => void;
}

export const AddReview: React.FC<AddReviewProps> = ({ doctorId, onAdded }) => {
    const { user } = useAuth();
    const { backend } = useBackend();
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [canReview, setCanReview] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        const checkEligibility = async () => {
            if (!user || user.role !== 'patient') {
                setCanReview(false);
                setIsLoading(false);
                return;
            }


            if (user.isBanned) {
                setCanReview(false);
                setIsLoading(false);
                return;
            }

            try {

                const appointments = await backend.getAppointmentsByPatient(String(user.id));
                const attendedThisDoctor = appointments.some(
                    (a: Appointment) => a.doctorId === doctorId &&
                        a.status === 'completed'  
                );


                const doctor = await backend.getDoctorById(doctorId);
                const alreadyReviewed = doctor?.reviews?.some(
                    r => r.author === (user.name || user.email)
                );

                setCanReview(attendedThisDoctor && !alreadyReviewed);
                setHasReviewed(!!alreadyReviewed);
            } catch (e) {
                console.error('Error checking review eligibility:', e);
                setCanReview(false);
            }

            setIsLoading(false);
        };

        checkEligibility();
    }, [user, doctorId, backend]);

    const handleSubmit = async () => {
        if (!user || !canReview) return;

        const rev: Review = {
            id: Date.now().toString(),
            author: user.name || user.email,
            rating,
            text
        };

        await backend.addReview(doctorId, rev);
        onAdded();
        setText('');
        setCanReview(false);
        setHasReviewed(true);
    };

    if (isLoading) {
        return <div className="mt-4 text-gray-400">Sprawdzam uprawnienia...</div>;
    }

    if (!user) {
        return (
            <div className="mt-4 border p-4 rounded bg-gray-50 text-center">
                <p className="text-gray-600">Zaloguj się, aby dodać opinię.</p>
            </div>
        );
    }

    if (user.isBanned) {
        return (
            <div className="mt-4 border p-4 rounded bg-red-50 text-center">
                <p className="text-red-600">Twoje konto jest zablokowane. Nie możesz dodawać opinii.</p>
            </div>
        );
    }

    if (hasReviewed) {
        return (
            <div className="mt-4 border p-4 rounded bg-green-50 text-center">
                <p className="text-green-600">Już dodałeś opinię dla tego lekarza.</p>
            </div>
        );
    }

    if (!canReview) {
        return (
            <div className="mt-4 border p-4 rounded bg-yellow-50 text-center">
                <p className="text-yellow-700">
                    Możesz dodać opinię tylko po odbyciu wizyty u tego lekarza.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 border p-4 rounded bg-gray-50">
            <h4 className="font-bold mb-2">⭐ Dodaj opinię</h4>

            {}
            <div className="flex gap-2 my-3">
                {[1, 2, 3, 4, 5].map(r => (
                    <button
                        key={r}
                        onClick={() => setRating(r)}
                        className={`text-3xl transition ${rating >= r ? 'text-yellow-400' : 'text-gray-300'
                            } hover:scale-110`}
                    >

                    </button>
                ))}
                <span className="text-gray-500 ml-2 self-center">{rating}/5</span>
            </div>

            <textarea
                className="w-full border p-3 rounded"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Napisz swoją opinię..."
                rows={3}
            />

            <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Wyślij opinię
            </button>
        </div>
    );
};
