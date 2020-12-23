import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas'; 
import { setFolderDirectory } from '../../Redux/actions';
import { Button, CircularProgress } from "@material-ui/core";
import { useSeries, useRS } from '../../Utilities/customHooks';
import  { pickDirectoryPath } from '../../Backend/fileHandler';

const useStyles = makeStyles((theme) => ({
    frame: {
        display: 'flex',
        flexDirection: 'row'
    },
    viewport: {
        width: 'calc(100vw - 270px)',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '512px 512px 512px',
        gridTemplateRows: '512px 1fr',
        overflow: 'auto'
    },
    viewCenter: {
        gridRow: '1',
        gridColumn: '1',
        background: 'black',
        borderColor: theme.palette.primary.main,
        borderWidth: 'thick'
    },
    viewRight: {
        gridRow: '1',
        gridColumn: '2',
        background: 'black'
    },
    viewBottom: {
        gridRow: '1',
        gridColumn: '3',
        background: 'black'
    },
    files: {
        gridRow: '2',
        gridColumn: '1 / 4'
    }
}));

function Dashboard() {
    const classes = useStyles();
    const dispatch = useDispatch();

    const series = useSeries();
    const rs = useRS();

    const [sliceX, setSliceX] = useState(0);
    const [sliceY, setSliceY] = useState(0);
    const [sliceZ, setSliceZ] = useState(0);
    const [selected, setSelected] = useState([]);
    const [contours, setContours] = useState({});

    function initPath() {
        dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01'));
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
            default:
                break;
        }
    }

    function handleChecked(checkedList) {
        setSelected(checkedList)
    }

    async function dirButton() {
        const newPathObj = await pickDirectoryPath();
        if (newPathObj.canceled || newPathObj.filePaths[0] == null) return;
        const newPath = newPathObj.filePaths[0];
        dispatch(setFolderDirectory(newPath));
    }

    useEffect(initPath, [dispatch]);
    // useEffect(() => genDetailSeries(), [series]);

    return (
        <div className={classes.frame}>
            <StructMenu rs={rs} handleChecked={handleChecked}></StructMenu>
            <div className={classes.viewport}>
                <div className={classes.viewCenter}><CTCanvas series={series} view='AXIAL' handleSlice={handleSlice} sliceNum={sliceZ} rs={rs} selected={selected}></CTCanvas></div>
                <div className={classes.viewRight}><CTCanvas series={series} view='CORONAL' handleSlice={handleSlice} sliceNum={sliceY} rs={rs} selected={selected}></CTCanvas></div>
                <div className={classes.viewBottom}><CTCanvas series={series} view='SAGITTAL' handleSlice={handleSlice} sliceNum={sliceX} rs={rs} selected={selected}></CTCanvas></div>
                <div className={classes.files}>
                    <Button variant="contained" onClick={dirButton}>Click to select new Folder</Button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
