import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  count?: number;
}

/**
 * Skeleton Loading Component
 * Used for loading states to improve perceived performance
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  count = 1,
  ...props
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-lg',
            className
          )}
          {...props}
        />
      ))}
    </>
  );
};

/**
 * Card Skeleton - Loading state for product/transaction cards
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full rounded-lg mt-4" />
    </div>
  </div>
);

/**
 * List Skeleton - Loading state for lists
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 flex gap-4">
        <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Form Skeleton - Loading state for forms
 */
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-lg" />
    <Skeleton className="h-12 w-full rounded-lg" />
    <Skeleton className="h-12 w-full rounded-lg" />
    <Skeleton className="h-12 w-full rounded-lg mt-6" />
  </div>
);

/**
 * Dashboard Skeleton - Loading state for dashboard
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 pb-20">
    {/* Header */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
    </div>

    {/* List */}
    <ListSkeleton count={4} />
  </div>
);
