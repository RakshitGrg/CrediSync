import React from 'react';

const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-emerald-900">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 border-2 rounded-full bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 ${
          error ? 'border-red-500' : 'border-emerald-100'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 ml-4">{error}</p>}
    </div>
  );
};

export default Input;