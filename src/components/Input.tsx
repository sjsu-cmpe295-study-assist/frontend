import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium mb-1.5 text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-md border transition-colors
            bg-[var(--background)]
            border-[var(--notion-gray-border)]
            text-[var(--foreground)]
            placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50
            focus:outline-none focus:ring-2 focus:ring-[var(--notion-blue-text)] focus:border-transparent
            ${error ? 'border-[var(--notion-red-border)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--notion-red-text)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

