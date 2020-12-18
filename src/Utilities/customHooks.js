import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, shallowEqual } from "react-redux";
import { Factory } from '../Backend/wrapperObjects';
import { readSeries } from '../Backend/fileHandler';


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
  const wrapped = useMemo(() => Factory.createWrapper(object, objectType), [object, objectType])

  return wrapped == null || Object.keys(wrapped).length === 0 ? null : wrapped;
}

export function useSeries() {
  const absDir = useSelector(state => state.files.folderDirectory, shallowEqual);
  const [series, setSeries] = useState(null);

  async function handleSeries() {
    if (absDir == null || absDir === '') return;
    readSeries(absDir).then(newSeries => setSeries(newSeries));
  }

  useEffect(() => handleSeries(), [absDir]);
  return series
}
