import React, { useState, useEffect } from "react";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import CTCanvas from '../CTCanvas';
import { useSeries, useRS } from '../../Backend/fileHooks';
import { useSelector, shallowEqual } from "react-redux";

const useStyles = makeStyles((theme) => ({
    frame: {
        display: 'flex',
        flexDirection: 'row'
    },
    main: {
        width: 'calc(100vw - 270px)',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '2rem 1fr 3fr 2rem',
        overflow: 'auto',
        background: theme.palette.surfacePrimary.main
    },
    title: {
        gridRow: '2',
        gridColumn: '1',
        margin: '2rem',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.surfacePrimary.contrastText
        // justifyContent: 'center'
    },
    infoContainer: {
        gridRow: '2',
        gridColumn: '2',
        margin: '2rem',
        marginBottom: '0px',
        padding: '1rem'
    },
    canvasContainer: {
        gridRow: '3',
        gridColumn: '1 / 3',
        display: 'flex'
    },
    canvasView: {
        margin: 'auto',
        marginBottom: '2rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'row',
        height: '512px',
        width: '1536px'
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

    useEffect(() => setSelected([]), [rs]);
    useEffect(initMiddle, [series])

    return (
        <div className={classes.frame}>
            <StructMenu rs={rs} handleChecked={handleChecked} loading={isLoading}></StructMenu>
            <div className={classes.main}>
                <div className={classes.title}>
                    <Typography variant={'h1'}>CT Images</Typography>
                </div>
                <Paper className={classes.infoContainer}>
                    <div><b>Basic CT Series Info Placeholder</b> {}</div>
                </Paper>
                <div className={classes.canvasContainer}>
                    <Paper className={classes.canvasView}>
                        <CTCanvas view='AXIAL' handleSlice={handleSlice} sliceNum={sliceZ} series={series} rs={rs} selected={selected} loading={isLoading}></CTCanvas>
                        <CTCanvas view='CORONAL' handleSlice={handleSlice} sliceNum={sliceY} series={series} rs={rs} selected={selected} loading={isLoading}></CTCanvas>
                        <CTCanvas view='SAGITTAL' handleSlice={handleSlice} sliceNum={sliceX} series={series} rs={rs} selected={selected} loading={isLoading}></CTCanvas>
                    </Paper>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
