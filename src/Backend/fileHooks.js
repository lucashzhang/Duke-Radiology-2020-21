import { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from "react-redux";
import { useDispatch } from "react-redux";
import { readRS, readSeries } from './fileHandler';
import { setFolderDirectory } from '../Redux/actions';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'workerize-loader!./file.worker.js';


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

    setSeries({});
    const seriesWorker = new Worker();
    readSeries(absDir, seriesWorker).then(newSeries => {
      if (newSeries !== {} && newSeries != null) setSeries(newSeries);
      seriesWorker.terminate();
    });

    return function cleanup() {
      seriesWorker.terminate();
    }
  }, [absDir]);
  return series;
}

export function useRS() {
  const absDir = useSelector(state => state.files.folderDirectory, shallowEqual);
  const [rs, setRS] = useState({});

  useEffect(() => {
    if (absDir == null || absDir === '') return;
    setRS({});
    const rsWorker = new Worker();
    readRS(absDir, rsWorker).then(newRS => {
      if (newRS !== {} && newRS != null) setRS(newRS);
      rsWorker.terminate();
    });

    return function cleanup() {
      rsWorker.terminate();
    }
  }, [absDir]);
  return rs;
}

export function useDirectory() {
  const absDir = useSelector(state => state.files.folderDirectory, shallowEqual);
  const dispatch = useDispatch();

  function setAbsDir(newPath) {
    dispatch(setFolderDirectory(newPath))
  }

  return [absDir, setAbsDir];
}
