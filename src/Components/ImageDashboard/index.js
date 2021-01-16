import React, { useState, useEffect } from "react";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import CTCanvas from '../CTCanvas';
import { useSeries, useRS, useRD } from '../../Backend/fileHooks';

const useStyles = makeStyles((theme) => ({
    frame: {
        display: 'flex',
        flexDirection: 'row',
        background: theme.palette.surfacePrimary.main
    },
    main: {
        width: 'calc(100vw - 270px)',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 784px 784px 1fr',
        gridTemplateRows: '2rem 1fr 3fr 2rem',
        overflow: 'auto',
    },
    title: {
        gridRow: '2',
        gridColumn: '2',
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.surfacePrimary.contrastText
        // justifyContent: 'center'
    },
    infoContainer: {
        gridRow: '2',
        gridColumn: '3',
        marginTop: '2rem',
        marginBottom: '0px',
        padding: '1rem'
    },
    canvasContainer: {
        gridRow: '3',
        gridColumn: '2 / 4',
        display: 'flex',
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
    const rd = useRD();

    const [sliceCoord, setSliceCoord] = useState({ x: 0, y: 0, z: 0 });
    const [selected, setSelected] = useState([]);
    const isLoading = Object.keys(rs).length === 0 || Object.keys(series).length === 0 || Object.keys(rd).length === 0;

    function initMiddle() {
        if (series == null || Object.keys(series).length === 0) return;
        setSliceCoord({
            x: Math.round(series.width / 2),
            y: Math.round(series.height / 2),
            z: Math.round(series.depth / 2)
        })
        // setSliceX(Math.round(series.width / 2));
        // setSliceY(Math.round(series.height / 2));
        // setSliceZ(Math.round(series.depth / 2));
    }

    function handleSlice(view, val1, val2, val3) {

        switch (view.toUpperCase()) {
            case 'AXIAL':
                setSliceCoord({
                    x: val1,
                    y: val2,
                    z: val3
                });
                break;
            case 'CORONAL':
                setSliceCoord({
                    x: val1,
                    y: val3,
                    z: val2
                });
                break;
            case 'SAGITTAL':
                setSliceCoord({
                    x: val3,
                    y: val1,
                    z: val2
                });
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
                    <div><b>Basic CT Series Info Placeholder</b> { }</div>
                </Paper>
                <div className={classes.canvasContainer}>
                    <Paper className={classes.canvasView}>
                        <CTCanvas view='AXIAL' handleSlice={handleSlice} series={series} rs={rs} rd={rd} selected={selected} loading={isLoading} sliceCoords={sliceCoord}></CTCanvas>
                        <CTCanvas view='CORONAL' handleSlice={handleSlice} series={series} rs={rs} rd={rd} selected={selected} loading={isLoading} sliceCoords={sliceCoord}></CTCanvas>
                        <CTCanvas view='SAGITTAL' handleSlice={handleSlice} series={series} rs={rs} rd={rd} selected={selected} loading={isLoading} sliceCoords={sliceCoord}></CTCanvas>
                    </Paper>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
