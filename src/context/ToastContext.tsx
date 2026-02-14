import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center justify-between p-4 rounded-2xl shadow-2xl backdrop-blur-xl border
                            transition-all duration-500 animate-[slideInRight_0.3s_ease-out]
                            ${toast.type === 'success' ? 'bg-white/90 border-[#C41230] text-black' : ''}
                            ${toast.type === 'error' ? 'bg-black/90 border-red-500 text-white' : ''}
                            ${toast.type === 'info' ? 'bg-white/90 border-gray-300 text-black' : ''}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">
                                {toast.type === 'success' && '✅'}
                                {toast.type === 'error' && '⚠️'}
                                {toast.type === 'info' && 'ℹ️'}
                            </span>
                            <p className="font-bold text-sm leading-tight">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 opacity-50 hover:opacity-100 font-black text-xs uppercase"
                        >
                            Close
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
