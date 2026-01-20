import type { ReactNode } from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-3'
    };

    return (
        <div className={`${sizeClasses[size]} border-gray-200 border-t-blue-600 rounded-full animate-spin ${className}`} />
    );
};

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay = ({ message = 'Ładowanie...' }: LoadingOverlayProps) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 font-medium">{message}</p>
        </div>
    </div>
);

interface LoadingCardProps {
    message?: string;
}

export const LoadingCard = ({ message = 'Ładowanie...' }: LoadingCardProps) => (
    <div className="bg-white rounded-xl p-8 shadow-md flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500">{message}</p>
    </div>
);

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
    </div>
);

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon = '📭', title, description, action }: EmptyStateProps) => (
    <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        {description && <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>}
        {action}
    </div>
);

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    onClose?: () => void;
}

export const Alert = ({ type, title, message, onClose }: AlertProps) => {
    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div className={`${styles[type]} border rounded-lg p-4 flex items-start gap-3 animate-slide-down`}>
            <span className="text-lg">{icons[type]}</span>
            <div className="flex-1">
                {title && <p className="font-semibold">{title}</p>}
                <p className="text-sm">{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="opacity-60 hover:opacity-100">
                    ✕
                </button>
            )}
        </div>
    );
};

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'primary';
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = 'Potwierdź',
    cancelText = 'Anuluj',
    onConfirm,
    onCancel,
    variant = 'primary'
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-slide-up">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-gray-600">{message}</p>
                </div>
                <div className="flex gap-3 p-4 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onCancel}
                        className="flex-1 btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface BadgeProps {
    children: ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    size?: 'sm' | 'md';
}

export const Badge = ({ children, variant = 'neutral', size = 'sm' }: BadgeProps) => {
    const variants = {
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        neutral: 'bg-gray-100 text-gray-800'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

interface TooltipProps {
    children: ReactNode;
    content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
    </div>
);
