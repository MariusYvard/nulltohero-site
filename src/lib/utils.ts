import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// MagicUI / shadcn class helper.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
