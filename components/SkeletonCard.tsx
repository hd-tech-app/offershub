
import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex-none w-36 sm:w-52 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800/50" />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        </div>
        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1.5 w-1/2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
