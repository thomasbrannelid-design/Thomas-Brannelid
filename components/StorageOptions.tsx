import React from 'react';
import type { StorageDestination } from '../types';
import { Spinner } from './Spinner';
import { NotionIcon } from './icons/NotionIcon';
import { GoogleSheetsIcon } from './icons/GoogleSheetsIcon';

interface StorageOptionsProps {
    selectedDests: Set<StorageDestination>;
    setSelectedDests: React.Dispatch<React.SetStateAction<Set<StorageDestination>>>;
    onSave: () => void;
    isSaving: boolean;
}

export const StorageOptions: React.FC<StorageOptionsProps> = ({ selectedDests, setSelectedDests, onSave, isSaving }) => {
    const toggleDestination = (dest: StorageDestination) => {
        setSelectedDests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dest)) {
                newSet.delete(dest);
            } else {
                newSet.add(dest);
            }
            return newSet;
        });
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Save to...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => toggleDestination('notion')}
                    className={`flex items-center justify-center p-4 border rounded-lg transition-all text-gray-700 ${selectedDests.has('notion') ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-500'}`}
                >
                    <NotionIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Notion</span>
                </button>
                <button
                    onClick={() => toggleDestination('google_sheets')}
                    className={`flex items-center justify-center p-4 border rounded-lg transition-all text-gray-700 ${selectedDests.has('google_sheets') ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-500'}`}
                >
                    <GoogleSheetsIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Google Sheets</span>
                </button>
            </div>
            <button
                onClick={onSave}
                disabled={isSaving || selectedDests.size === 0}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isSaving ? (
                    <>
                        <Spinner />
                        Saving...
                    </>
                ) : (
                    'Save Contact'
                )}
            </button>
        </div>
    );
};