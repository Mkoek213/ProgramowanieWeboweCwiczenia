import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export const NotificationToast = () => {
    const { scheduleUpdates, hasNewUpdates, clearUpdates } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (hasNewUpdates && scheduleUpdates.length > 0) {
            setIsOpen(true);
            const timer = setTimeout(() => {
                setIsOpen(false);
                clearUpdates();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hasNewUpdates, scheduleUpdates.length]);

    if (!isOpen || scheduleUpdates.length === 0) return null;

    const latestUpdate = scheduleUpdates[0];

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 max-w-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">
                            {latestUpdate.type === 'absence' && ''}
                            {latestUpdate.type === 'cancelled' && ''}
                            {latestUpdate.type === 'availability_change' && ''}
                            {latestUpdate.type === 'new_slot' && ''}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Aktualizacja harmonogramu</p>
                            <p className="text-sm text-gray-600">{latestUpdate.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {latestUpdate.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            clearUpdates();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >

                    </button>
                </div>

                {scheduleUpdates.length > 1 && (
                    <p className="text-xs text-blue-600 mt-2">
                        +{scheduleUpdates.length - 1} więcej aktualizacji
                    </p>
                )}
            </div>
        </div>
    );
};
