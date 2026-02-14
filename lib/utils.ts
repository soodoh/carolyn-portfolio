import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const containerClass = "mx-auto w-[calc(100%-3rem)] max-w-[1440px] grow";
