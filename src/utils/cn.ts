/**
 * Utility function for merging class names
 * Filters out falsy values and joins remaining classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
