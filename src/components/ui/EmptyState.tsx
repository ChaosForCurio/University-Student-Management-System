import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center"
        >
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                <Icon className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
