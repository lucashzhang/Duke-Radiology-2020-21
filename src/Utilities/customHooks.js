import { useEffect, useState, useMemo } from 'react';
import { useSelector, shallowEqual } from "react-redux";
import { Factory } from '../Backend/wrapperObjects';
import { readRS, readSeries } from '../Backend/fileHandler';


export function useDebounce(value, delay) {
  // Allows for debouncing
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const dbHandler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay);

    return () => clearTimeout(dbHandler);
  }, [value, delay]);

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
  const [series, setSeries] = useState({});

  useEffect(() => {
    if (absDir == null || absDir === '') return;
    readSeries(absDir).then(newSeries => setSeries(newSeries));
  }, [absDir]);
  return series;
}

export function useRS() {
  const absDir = useSelector(state => state.files.folderDirectory, shallowEqual);
  const [rs, setRS] = useState({});

  useEffect(() => {
    if (absDir == null || absDir === '') return;
    readRS(absDir).then(newSeries => setRS(newSeries));
  }, [absDir]);
  return rs;
}
