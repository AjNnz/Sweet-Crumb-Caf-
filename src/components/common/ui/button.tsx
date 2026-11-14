import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "large";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60 cursor-pointer select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm active:scale-[0.98]",
  secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm active:scale-[0.98]",
  outline: "border border-primary/25 bg-white text-primary hover:bg-latte",
  ghost: "text-espresso hover:bg-latte",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]",
  large: "bg-accent text-espresso hover:bg-accent/85 text-lg font-semibold shadow-md active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
