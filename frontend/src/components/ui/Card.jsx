import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div 
      className={cn("glass-card rounded-2xl p-6 premium-shadow", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
