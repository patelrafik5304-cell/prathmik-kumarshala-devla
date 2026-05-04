'use client';

import { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 bg-gray-50/50 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
