import { useEffect, useState } from "react";

/** Devuelve `value` recién después de `delay` ms sin cambios — para no
 * recalcular búsquedas costosas en cada tecla presionada. */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
