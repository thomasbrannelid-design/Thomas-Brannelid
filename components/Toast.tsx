import React, { useEffect } from 'react';
import type { ToastMessage } from '../types';

interface ToastProps extends ToastMessage {
    onClose: () => void;
}

const toastStyles = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-blue-500',
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg bg-white text-gray-800 border-l-4 ${toastStyles[type]} animate-fade-in z-50 flex items-center justify-between`}
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-800 font-bold">&times;</button>
        </div>
    );
};