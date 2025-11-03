import React from 'react';
import type { RawInputs } from '../types';
import { Spinner } from './Spinner';

interface InputFormProps {
    rawInputs: RawInputs;
    setRawInputs: React.Dispatch<React.SetStateAction<RawInputs>>;
    onEnrich: () => void;
    isLoading: boolean;
}

const InputField: React.FC<{
    id: keyof RawInputs;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}> = ({ id, label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
            {label}
        </label>
        <input
            type="text"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
    </div>
);

export const InputForm: React.FC<InputFormProps> = ({ rawInputs, setRawInputs, onEnrich, isLoading }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRawInputs(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">1. Enter Contact Details</h2>
            <div className="space-y-4">
                <InputField id="name" label="Person Name" value={rawInputs.name} onChange={handleChange} placeholder="e.g., Jane Doe" />
                <InputField id="company" label="Company Name" value={rawInputs.company} onChange={handleChange} placeholder="e.g., Acme Inc." />
                <InputField id="linkedinUrl" label="LinkedIn Profile URL" value={rawInputs.linkedinUrl} onChange={handleChange} placeholder="e.g., https://linkedin.com/in/janedoe" />
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-600 mb-1">
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={6}
                        value={rawInputs.notes}
                        onChange={handleChange}
                        placeholder="Add any notes here... sales call summary, meeting details, etc."
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
            </div>
            <button
                onClick={onEnrich}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <Spinner />
                        Enriching...
                    </>
                ) : (
                    'Enrich Contact'
                )}
            </button>
        </div>
    );
};