/** Strip non-digits, cap at 10, format as "XXXXX XXXXX". */
export function formatPhone10(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** onKeyDown handler — blocks non-digit keys on desktop. */
export function blockNonDigitKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

/** onKeyDown handler for international phone fields — allows digits and leading +. */
export function blockNonPhoneKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
  const input = e.currentTarget;
  // allow + only as the very first character
  if (e.key === "+" && input.selectionStart === 0 && !input.value.includes("+")) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}
