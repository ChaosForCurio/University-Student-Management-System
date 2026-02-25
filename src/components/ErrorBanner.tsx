import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';

export function ErrorBanner() {
    const { error, clearError } = useAttendance();

    return (
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-rose-50 border-b border-rose-100 overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                            <p className="ml-3 text-sm font-medium text-rose-800 truncate">
                                {error}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                type="button"
                                onClick={clearError}
                                className="bg-rose-50 rounded-md inline-flex text-rose-500 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 p-1"
                            >
                                <span className="sr-only">Dismiss</span>
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
