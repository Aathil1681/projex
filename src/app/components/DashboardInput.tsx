// components/Input.tsx
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: any;
  icon?: React.ReactNode;
  register?: UseFormRegisterReturn;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  register,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...register}
          {...props}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${icon ? "pl-10" : "pl-4"}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default Input;
