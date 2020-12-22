import { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from "react-redux";
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

export function useSeries() {
  const absDir = useSelector(state => state.files.folderDirectory, shallowEqual);
  const [series, setSeries] = useState({});

  useEffect(() => {
    if (absDir == null || absDir === '') return;
    readSeries(absDir).then(newSeries => {
      if (newSeries != {} && newSeries != null) setSeries(newSeries)
    });
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
