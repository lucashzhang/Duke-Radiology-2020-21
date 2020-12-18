import { useEffect, useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { Wrapper } from '../Backend/wrapperObjects';


export function useDebounce(value, delay) {
  // Allows for debouncing
  const [debouncedValue, setDebouncedValue] = useState(value);

  function init() {
    const dbHandler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay);

    return () => clearTimeout(dbHandler);
  }

  useEffect(init, [value]);

  return debouncedValue;
}

export function useWrapperSelector(selectorFunction, equality, objectType) {
  // Custom hook to wrap the object ob it's way out
  const object = useSelector(selectorFunction, equality);
  const wrapped = useMemo(() => Wrapper.factory(object, objectType), [object, objectType])

  return wrapped == null || Object.keys(wrapped).length === 0 ? null : wrapped;
}
