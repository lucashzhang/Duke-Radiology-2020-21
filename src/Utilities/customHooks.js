import { useEffect, useState } from 'react';

export function useDebounce(value, delay) {

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
  