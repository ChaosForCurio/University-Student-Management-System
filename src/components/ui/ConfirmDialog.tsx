import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) {
    const colors = {
        danger: {
            bg: 'bg-red-50',
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        },
        warning: {
            bg: 'bg-amber-50',
            icon: 'text-amber-500',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        },
        info: {
            bg: 'bg-primary-50',
            icon: 'text-primary-500',
            button: 'bg-primary-600 hover:bg-primary-700 shadow-primary-200',
        }
    };

    const style = colors[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                    >
                        <div className={`p-6 ${style.bg} flex items-center gap-4`}>
                            <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 ${style.icon}`}>
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                {message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${style.button}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
