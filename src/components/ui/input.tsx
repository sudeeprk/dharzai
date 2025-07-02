import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, required, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {required && (
          <span className="absolute -right-1 top-[-6px] text-red-500 text-xl font-semibold leading-none select-none">
            *
          </span>
        )}
        <input
          type={type}
          aria-required={required}
          className={cn(
            "flex h-10 w-full rounded-md dark:border-slate-800 border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-opacity-50 focus-visible:shadow-[0_0_0_0.5px_rgba(59,130,246,0.5)] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
