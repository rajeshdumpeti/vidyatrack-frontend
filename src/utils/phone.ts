/**
 * Returns only digit characters from the input.
 *
 * Why:
 * - Users may type spaces, dashes, parentheses, or paste formatted numbers.
 * - Backend/validation typically expects a normalized numeric string.
 *
 * Examples:
 *  - "+1 (987) 654-3210" -> "19876543210"
 *  - "98765 43210"       -> "9876543210"
 */
export function digitsOnly(input: string): string {
  return input.replace(/[^\d]/g, "");
}
