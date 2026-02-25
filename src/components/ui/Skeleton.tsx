import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = "bg-slate-200 overflow-hidden relative";
    const variantClasses = {
        rectangular: "rounded-lg",
        circular: "rounded-full",
        text: "rounded h-4 mb-2"
    };

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
            initial={{ opacity: 0.5 }}
            animate={{
                opacity: [0.5, 0.8, 0.5],
                transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </motion.div>
    );
}
