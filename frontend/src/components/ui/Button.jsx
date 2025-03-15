import React from 'react';

const Button = ({ children, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      className={`w-full mt-2 px-6 py-4 text-white bg-emerald-700 rounded-full hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;