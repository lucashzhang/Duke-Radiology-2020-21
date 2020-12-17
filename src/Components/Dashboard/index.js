import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';

import { setFolderDirectory } from '../../Redux/actions';
import { readDir } from '../../Backend/fileHandler';
import { CircularProgress } from "@material-ui/core";
import { CTSeries } from '../../Backend/fileObjects';

const useStyles = makeStyles(() => ({
    frame: {
        display: 'flex',
        flexDirection: 'row'
    },
    viewport: {
        width: 'calc(100vw - 270px)',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '512px 1fr',
        gridTemplateRows: '512px 1fr',
        // background: 'black'
    },
    viewCenter: {
        gridRow: '1',
        gridColumn: '1',
    },
    viewRight: {
        gridRow: '1',
        gridColumn: '2',
    },
    viewBottom: {
        gridRow: '2',
        gridColumn: '1',
    }
}));

function Dashboard() {
    const classes = useStyles();
    const dispatch = useDispatch();

    const [structs, setStructs] = useState([]);
    const [series, setSeries] = useState(null);
    const [doses, setDoses] = useState([]);
    const dirPath = useSelector(state => state.directory.folderDirectory, shallowEqual);

    const [sliceX, setSliceX] = useState(0);
    const [sliceY, setSliceY] = useState(0);
    const [sliceZ, setSliceZ] = useState(0);

    function readFiles() {
        if (dirPath === '' || dirPath == null) return;
        readDir(dirPath).then(res => {
            setStructs(res['RS'].structList);
            setSeries(new CTSeries(res['CT']));
        })

    }

    function initPath() {
        dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/09'));
    }

    function handleSlice(plane, value) {
        switch (plane) {
            case 'X':
                setSliceX(value);
                break;
            case 'Y':
                setSliceY(value);
                break;
            case 'Z':
                setSliceZ(value);
                break;
        }
    }

    function handleChecked(checkedList) {
        setDoses(checkedList);
    }

    useEffect(initPath, []);
    useEffect(readFiles, [dirPath]);
    // useEffect(() => genDetailSeries(), [series]);

    return (
        <div className={classes.frame}>
            <StructMenu structs={structs} handleChecked={handleChecked}></StructMenu>
            <div className={classes.viewport}>
                <div className={classes.viewCenter}><CTCanvas series={series} view='AXIAL' handleSlice={handleSlice} sliceNum={sliceZ}></CTCanvas></div>
                <div className={classes.viewRight}><CTCanvas series={series} view='SAGITTAL' handleSlice={handleSlice} sliceNum={sliceX}></CTCanvas></div>
                <div className={classes.viewBottom}><CTCanvas series={series} view='CORONAL' handleSlice={handleSlice} sliceNum={sliceY}></CTCanvas></div>
                <CircularProgress></CircularProgress>
            </div>
        </div>
    );
}

export default Dashboard;
