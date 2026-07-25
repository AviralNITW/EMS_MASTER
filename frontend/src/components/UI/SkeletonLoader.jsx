import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array(count).fill(0);

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-t-lg mb-2"></div>
        {skeletons.map((_, index) => (
          <div key={index} className="flex space-x-4 mb-2">
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-lg flex-1"></div>
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-lg flex-1"></div>
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-lg flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <>
      {skeletons.map((_, index) => (
        <div key={index} className="w-full bg-card rounded-2xl p-6 border border-gray-200 dark:border-white/10 animate-pulse flex flex-col space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
