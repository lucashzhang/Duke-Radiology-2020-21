import React, { useState, useEffect } from "react";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
    },
    canvasContainer: {
        display: 'flex',
    },
    canvasView: {
        // padding: '0.75rem 0.75rem 0.75rem 0rem',
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, min(45vh - 0.5rem, 45vw - 0.5rem))',
        gridTemplateRows: 'repeat(2, min(45vh - 0.5rem, 45vw - 0.5rem))',
        gridGap: '1rem',
        height: 'min(90vh + 1.5rem, 90vw + 1.5rem)',
        width: 'min(135vh + 2rem, 135vw + 2rem)'
    },
    canvasMain: {
        gridRow: '1/3',
        gridColumn: '1/3',
    },
    canvasSide1: {
        gridRow: '1/3'
    }
}));

function Dashboard() {
    const classes = useStyles();

    const series = useSeries();
    const rs = useRS();
    const rd = useRD();

    const [sliceCoord, setSliceCoord] = useState({ x: 0, y: 0, z: 0 });
    const [isDose, setIsDose] = useState(false);
    const [canvasSize, setCanvasSize] = useState(512);
    const isLoading = Object.keys(rs).length === 0 || Object.keys(series).length === 0;

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

    function toggleDose() {
        setIsDose(prevState => !prevState);
    }

    useEffect(() => {

        function handleResize() {
            const newSize = Math.min(window.innerWidth * 0.9 - 16, window.innerHeight * 0.9 - 16);
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
            <StructMenu isDose={isDose} toggleDose={toggleDose}></StructMenu>
            <div className={classes.main}>
                <div className={classes.canvasContainer}>
                    <Paper className={classes.canvasView}>
                        <div className={classes.canvasMain}>
                            <CTCanvas
                                view='AXIAL'
                                width={canvasSize + 8}
                                height={canvasSize + 8}
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
                                width={canvasSize / 2 - 6}
                                height={canvasSize / 2 - 6}
                                handleSlice={handleSlice}
                                series={series}
                                rs={rs}
                                rd={rd}
                                loading={isLoading}
                                sliceCoords={sliceCoord}
                                isDose={isDose}
                            ></CTCanvas>
                        </div>
                        <div className={classes.canvas}>
                            <CTCanvas
                                view='SAGITTAL'
                                width={canvasSize / 2 - 6}
                                height={canvasSize / 2 - 6}
                                handleSlice={handleSlice}
                                series={series}
                                rs={rs}
                                rd={rd}
                                loading={isLoading}
                                sliceCoords={sliceCoord}
                                isDose={isDose}
                            ></CTCanvas>
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
