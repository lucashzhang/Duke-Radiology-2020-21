import React, { useState, useEffect } from "react";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';
import { useSeries, useRS } from '../../Utilities/customHooks';

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

    const series = useSeries();
    const rs = useRS();

    const [sliceX, setSliceX] = useState(0);
    const [sliceY, setSliceY] = useState(0);
    const [sliceZ, setSliceZ] = useState(0);
    const [selected, setSelected] = useState([]);
    const isLoading = Object.keys(rs).length === 0 || Object.keys(series).length === 0;

    // function initPath() {
    //     dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01'));
    // }

    function initMiddle() {
        if (series == null || Object.keys(series).length === 0) return;
        setSliceX(Math.round(series.width / 2));
        setSliceY(Math.round(series.height / 2));
        setSliceZ(Math.round(series.depth / 2));
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

    // useEffect(initPath, [dispatch]);
    useEffect(() => setSelected([]), [rs]);
    useEffect(initMiddle, [series])
    // useEffect(() => genDetailSeries(), [series]);

    return (
        <div className={classes.frame}>
            <StructMenu rs={rs} handleChecked={handleChecked} loading={isLoading}></StructMenu>
            <div className={classes.viewport}>
                <div className={classes.viewCenter}><CTCanvas view='AXIAL' handleSlice={handleSlice} sliceNum={sliceZ} series={series}  rs={rs} selected={selected} loading={isLoading}></CTCanvas></div>
                <div className={classes.viewRight}><CTCanvas view='CORONAL' handleSlice={handleSlice} sliceNum={sliceY} series={series} rs={rs} selected={selected} loading={isLoading}></CTCanvas></div>
                <div className={classes.viewBottom}><CTCanvas view='SAGITTAL' handleSlice={handleSlice} sliceNum={sliceX} series={series} rs={rs} selected={selected} loading={isLoading}></CTCanvas></div>
            </div>
        </div>
    );
}

export default Dashboard;
