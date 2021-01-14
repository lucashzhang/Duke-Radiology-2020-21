import React, { useState, useRef, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';
import { CircularProgress } from '@material-ui/core';
import CTLayer from './CTLayer';
import OverlayLayer from './OverlayLayer';

const useStyles = makeStyles(() => ({
    canvasContainer: {
        position: 'relative',
        width: '512px',
        height: '512px',
        backgroundColor: 'black',
    },
    canvas: {
        cursor: 'pointer',
        gridColumn: '1',
        gridRow: '1',
        zIndex: '100',
        position: 'absolute'
    },
    loading: {
        gridColumn: '1',
        gridRow: '1',
        zIndex: '10',
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));


function CTCanvas(props) {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;
    const series = props.series;
    const minSlice = getMinSlice();
    const view = props.view;
    const [maxDepth, maxWidth, maxHeight] = getMax();
    const [isHold, setIsHold] = useState(false);
    const equiv = getCoordEquiv();

    const drawText = useCallback(drawTextOverlay, [props.sliceNum, props.view]);

    const isLoading = props.loading != null ? props.loading : false;

    function getCoordEquiv() {
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return { x: 'X', y: 'Y', z: 'Z' }
            case 'CORONAL':
                return { x: 'X', y: 'Z', z: 'Y' }
            case 'SAGITTAL':
                return { x: 'Y', y: 'Z', z: 'X' }
            default:
                return { x: '', y: '', z: '' }
        }
    }

    function getMinSlice() {
        if (series == null) return;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return series.minZ
            case 'CORONAL':
                return series.minY
            case 'SAGITTAL':
                return series.minX
            default:
                return 1
        }
    }

    function getMax() {
        if (series == null) return [1, 512, 512];
        switch (view.toUpperCase()) {
            case 'AXIAL':
                return [series.depth, series.width, series.height];
            case 'CORONAL':
                return [series.height, series.width, series.depth];
            case 'SAGITTAL':
                return [series.width, series.height, series.depth];
            default:
                return 1;
        }
    }

    function getSpacing() {
        if (series == null || series.pixelSpacing == null) return 1;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return 1;
            case 'CORONAL':
                return series.pixelSpacing[1];
            case 'SAGITTAL':
                return series.pixelSpacing[0];
            default:
                return 1;
        }
    }

    function drawCrosshairs(x, y) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = theme.palette.primary.light;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasRef.current.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.current.width, y);
        ctx.stroke();
    }

    function drawTextOverlay() {

        function getSpacing() {
            if (series == null || series.pixelSpacing == null) return 1;
            switch (props.view.toUpperCase()) {
                case 'AXIAL':
                    return 1;
                case 'CORONAL':
                    return series.pixelSpacing[1];
                case 'SAGITTAL':
                    return series.pixelSpacing[0];
                default:
                    return 1;
            }
        }

        const ctx = canvasRef.current.getContext('2d');
        ctx.font = '16px sans-serif';
        ctx.textAlign = "center";
        ctx.fillStyle = theme.palette.primary.light;
        ctx.fillText(props.view.toUpperCase(), 256, 24);
        ctx.fillText(`Slice Position: ${(props.sliceNum * getSpacing() + minSlice).toFixed(4)}mm`, series.width / 2, series.height - 12);
    }

    function handleUserKeyPress(e) {
        if (series == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            // Increments forward
            props.handleSlice(equiv.z, props.sliceNum < maxDepth - 1 ? props.sliceNum + 1 : maxDepth - 1);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            // Increments backward
            props.handleSlice(equiv.z, props.sliceNum > 0 ? props.sliceNum - 1 : 0);
        }
    }

    function handleUserScroll(e) {
        if (series == null) return;
        const direction = e.deltaY;
        if (direction > 0) {
            // On scroll down
            props.handleSlice(equiv.z, props.sliceNum > 0 ? props.sliceNum - 1 : 0);
        } else if (direction < 0) {
            // On scroll up
            props.handleSlice(equiv.z, props.sliceNum < maxDepth - 1 ? props.sliceNum + 1 : maxDepth - 1);
        }
    }

    function handleCrosshair(e, override = false) {
        
        if ((!isHold && !override) || series == null) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0,0,512,512)
        const drawXOffset = Math.floor((series.width - maxWidth) / 2);
        const drawYOffset = Math.floor((series.height - maxHeight) / 2);
        const rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        props.handleSlice(equiv.x, x - drawXOffset);
        props.handleSlice(equiv.y, y - drawYOffset);
        drawCrosshairs(x, y);
    }


    return (
        <div
            className={classes.canvasContainer}
        >
            <CTLayer sliceNum={props.sliceNum} series={props.series} view={props.view}></CTLayer>
            <OverlayLayer sliceNum={props.sliceNum} rs={props.rs} view={props.view} minSlice={minSlice} selected={props.selected}></OverlayLayer>
            <canvas
                ref={canvasRef}
                className={classes.canvas}
                onKeyDown={handleUserKeyPress}
                onWheel={handleUserScroll}
                onMouseDown={(e) => { setIsHold(true); handleCrosshair(e, true) }}
                onMouseUp={() => setIsHold(false)}
                onMouseLeave={() => setIsHold(false)}
                onMouseMove={handleCrosshair}
                tabIndex="0"
                width={512}
                height={512}
            >
            </canvas>
            {series == null || Object.keys(series).length === 0 || isLoading ? <div className={classes.loading}>
                <CircularProgress color='primary'></CircularProgress>
            </div> : null}
        </div>
    );
}

export default CTCanvas;