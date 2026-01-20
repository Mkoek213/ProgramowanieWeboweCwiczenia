import { useState } from 'react';
import type { Availability, TimeRange } from '../models/types';
import { DAY_NAMES_FULL } from '../models/types';

interface AvailabilityManagerProps {
    doctorId: string;
    availabilities: Availability[];
    onAdd: (av: Availability) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const AvailabilityManager = ({
    doctorId,
    availabilities,
    onAdd,
    onDelete
}: AvailabilityManagerProps) => {
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState<'cyclic' | 'one_time'>('cyclic');

    // Cyclic form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dayMask, setDayMask] = useState<boolean[]>([true, true, true, true, true, false, false]);
    const [timeRanges, setTimeRanges] = useState<TimeRange[]>([{ from: '08:00', to: '12:00' }]);

    // One-time form state
    const [oneTimeDate, setOneTimeDate] = useState('');
    const [oneTimeSlots, setOneTimeSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState('09:00');

    const handleDayToggle = (index: number) => {
        const newMask = [...dayMask];
        newMask[index] = !newMask[index];
        setDayMask(newMask);
    };

    const addTimeRange = () => {
        setTimeRanges([...timeRanges, { from: '14:00', to: '18:00' }]);
    };

    const removeTimeRange = (index: number) => {
        setTimeRanges(timeRanges.filter((_, i) => i !== index));
    };

    const updateTimeRange = (index: number, field: 'from' | 'to', value: string) => {
        const newRanges = [...timeRanges];
        newRanges[index][field] = value;
        setTimeRanges(newRanges);
    };

    const addOneTimeSlot = () => {
        if (newSlot && !oneTimeSlots.includes(newSlot)) {
            setOneTimeSlots([...oneTimeSlots, newSlot].sort());
        }
    };

    const removeOneTimeSlot = (slot: string) => {
        setOneTimeSlots(oneTimeSlots.filter(s => s !== slot));
    };

    const handleSubmit = async () => {
        const av: Availability = {
            id: Date.now().toString(),
            doctorId,
            type: formType
        };

        if (formType === 'cyclic') {
            if (!startDate || !endDate) {
                alert('Podaj daty początku i końca okresu');
                return;
            }
            av.startDate = startDate;
            av.endDate = endDate;
            av.dayMask = dayMask;
            av.timeRanges = timeRanges;
        } else {
            if (!oneTimeDate || oneTimeSlots.length === 0) {
                alert('Podaj datę i przynajmniej jeden slot czasowy');
                return;
            }
            av.date = oneTimeDate;
            av.slots = oneTimeSlots;
        }

        await onAdd(av);
        resetForm();
    };

    const resetForm = () => {
        setShowForm(false);
        setStartDate('');
        setEndDate('');
        setDayMask([true, true, true, true, true, false, false]);
        setTimeRanges([{ from: '08:00', to: '12:00' }]);
        setOneTimeDate('');
        setOneTimeSlots([]);
    };

    const myAvailabilities = availabilities.filter(a => a.doctorId === doctorId);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Dostępność</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    {showForm ? 'Anuluj' : '+ Dodaj dostępność'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="border rounded p-4 mb-4 bg-gray-50">
                    {/* Type selector */}
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Typ dostępności:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formType === 'cyclic'}
                                    onChange={() => setFormType('cyclic')}
                                    className="mr-2"
                                />
                                Cykliczna (powtarzalna)
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formType === 'one_time'}
                                    onChange={() => setFormType('one_time')}
                                    className="mr-2"
                                />
                                Jednorazowa
                            </label>
                        </div>
                    </div>

                    {formType === 'cyclic' ? (
                        <>
                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-1">Od daty:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="border p-2 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Do daty:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="border p-2 w-full rounded"
                                    />
                                </div>
                            </div>

                            {/* Day mask */}
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Dni tygodnia:</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAY_NAMES_FULL.map((day, i) => (
                                        <label
                                            key={day}
                                            className={`px-3 py-1 rounded border cursor-pointer ${dayMask[i] ? 'bg-blue-500 text-white' : 'bg-white'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={dayMask[i]}
                                                onChange={() => handleDayToggle(i)}
                                                className="hidden"
                                            />
                                            {day}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Time ranges */}
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Godziny konsultacji:</label>
                                {timeRanges.map((range, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="time"
                                            value={range.from}
                                            onChange={e => updateTimeRange(i, 'from', e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                        <span>-</span>
                                        <input
                                            type="time"
                                            value={range.to}
                                            onChange={e => updateTimeRange(i, 'to', e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                        {timeRanges.length > 1 && (
                                            <button
                                                onClick={() => removeTimeRange(i)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addTimeRange}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    + Dodaj przedział czasowy
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* One-time date */}
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Data:</label>
                                <input
                                    type="date"
                                    value={oneTimeDate}
                                    onChange={e => setOneTimeDate(e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>

                            {/* Slots */}
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Sloty czasowe:</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="time"
                                        value={newSlot}
                                        onChange={e => setNewSlot(e.target.value)}
                                        className="border p-2 rounded"
                                        step="1800"
                                    />
                                    <button
                                        onClick={addOneTimeSlot}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Dodaj
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {oneTimeSlots.map(slot => (
                                        <span
                                            key={slot}
                                            className="bg-green-100 px-3 py-1 rounded flex items-center gap-2"
                                        >
                                            {slot}
                                            <button
                                                onClick={() => removeOneTimeSlot(slot)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                        Zapisz dostępność
                    </button>
                </div>
            )}

            {/* List of existing availabilities */}
            <div className="space-y-2">
                {myAvailabilities.length === 0 ? (
                    <p className="text-gray-500">Brak zdefiniowanej dostępności</p>
                ) : (
                    myAvailabilities.map(av => (
                        <div key={av.id} className="border rounded p-3 flex justify-between items-start">
                            <div>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${av.type === 'cyclic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                    {av.type === 'cyclic' ? 'Cykliczna' : 'Jednorazowa'}
                                </span>
                                {av.type === 'cyclic' ? (
                                    <div className="text-sm">
                                        <p>{av.startDate} - {av.endDate}</p>
                                        <p className="text-gray-600">
                                            Dni: {av.dayMask?.map((d, i) => d ? DAY_NAMES_FULL[i].slice(0, 3) : null).filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-gray-600">
                                            Godziny: {av.timeRanges?.map(r => `${r.from}-${r.to}`).join(', ')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-sm">
                                        <p>{av.date}</p>
                                        <p className="text-gray-600">Sloty: {av.slots?.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => onDelete(av.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Usuń
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
