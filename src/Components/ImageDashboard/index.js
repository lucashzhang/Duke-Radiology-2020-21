import React, { useState, useEffect } from "react";
import DoseMenu from '../Drawer/dose';
import StructMenu from '../Drawer/structures';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';
import CTCanvas from '../CTCanvas';
import { useSeries, useRS, useRD } from '../../Backend/fileHooks';

const useStyles = makeStyles((theme) => ({
    frame: {
        display: 'flex',
        flexDirection: 'row',
        background: theme.palette.surfacePrimary.main,
        justifyContent: 'center'
    },
    main: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'min(165vh + 1rem, 100vw - 8rem)'
    },
    canvasView: {
        margin: '1rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'row',
        height: 'min(55vh + 1rem, 33vw - 1.5rem)',
        width: '100%'
    },
    canvas: {
        marginLeft: '1rem'
    },
    options: {
        height: 'calc(100vh - min(55vh + 1rem, 33vw - 1.5rem) - 2rem)',
    }
}));

function Dashboard() {
    const classes = useStyles();

    const series = useSeries();
    const rs = useRS();
    const rd = useRD();

    const [sliceCoord, setSliceCoord] = useState({ x: 0, y: 0, z: 0 });
    const [canvasSize, setCanvasSize] = useState(512);
    const isLoading = Object.keys(series).length === 0;

    function initMiddle() {
        if (series == null || Object.keys(series).length === 0) return;
        setSliceCoord({
            x: Math.round(series.width / 2),
            y: Math.round(series.height / 2),
            z: Math.round(series.depth / 2)
        })
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

    useEffect(() => {

        function handleResize() {
            const newSize = Math.min(window.innerWidth / 3 - 64, window.innerHeight * 0.55 - 16);
            setCanvasSize(newSize);
        }
        handleResize();
        window.addEventListener('resize', handleResize);

        return function cleanup() {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    useEffect(initMiddle, [series])

    return (
        <div className={classes.frame}>
            {/* <StructMenu isDose={isDose} toggleDose={toggleDose}></StructMenu> */}
            <div className={classes.main}>
                <Paper className={classes.canvasView}>
                    <div className={classes.canvasMain}>
                        <CTCanvas
                            view='AXIAL'
                            width={canvasSize}
                            height={canvasSize}
                            handleSlice={handleSlice}
                            series={series}
                            rs={rs}
                            rd={rd}
                            loading={isLoading}
                            sliceCoords={sliceCoord}
                        ></CTCanvas>
                    </div>
                    <div className={classes.canvas}>
                        <CTCanvas
                            view='CORONAL'
                            width={canvasSize}
                            height={canvasSize}
                            handleSlice={handleSlice}
                            series={series}
                            rs={rs}
                            rd={rd}
                            loading={isLoading}
                            sliceCoords={sliceCoord}
                        ></CTCanvas>
                    </div>
                    <div className={classes.canvas}>
                        <CTCanvas
                            view='SAGITTAL'
                            width={canvasSize}
                            height={canvasSize}
                            handleSlice={handleSlice}
                            series={series}
                            rs={rs}
                            rd={rd}
                            loading={isLoading}
                            sliceCoords={sliceCoord}
                        ></CTCanvas>
                    </div>
                </Paper>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12} className={classes.options}>
                        <DoseMenu></DoseMenu>
                    </Grid>
                    <Grid item md={6} xs={12} className={classes.options}>
                        <StructMenu></StructMenu>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}

export default Dashboard;
