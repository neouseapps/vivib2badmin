import { cva, type VariantProps } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";
import clsx, { type ClassValue } from "clsx";

export { cva };
export type { VariantProps };

// Custom font-size names defined in tailwind.config.ts must be registered with
// tailwind-merge — otherwise it groups them with text colors (same `text-*`
// prefix) and silently drops the color when a size is appended.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["cap", "cap-md", "body", "h5", "h4", "h3", "h2", "h1", "display-sm", "display-md", "display-lg"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
