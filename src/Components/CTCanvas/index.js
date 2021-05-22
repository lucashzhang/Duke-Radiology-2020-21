import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import CTLayer from './CTLayer';
import OverlayLayer from './RSLayer';
import RDLayer from './RDLayer';

const useStyles = makeStyles((theme) => ({
    canvasContainer: {
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: '0.25rem',
        "& canvas": {
            borderRadius: '0.25rem'
        },
        "&:focus": {
            outline: 'none',
            border: 'solid 3px'
        }
    },
    canvas: {
        cursor: 'pointer',
        gridColumn: '1',
        gridRow: '1',
        zIndex: '100',
        position: 'absolute',
        boxSizing: 'border-box',
        "&:focus": {
            outline: 'none',
            boxShadow: `0px 0px 0px 3px ${theme.palette.primary.main}`
            // border: 'solid 3px'
        }
    },
    loading: {
        position: 'absolute',
        zIndex: '300',
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.25rem',
    }
}));


function CTCanvas(props) {

    const { view, series, width, height } = props;
    const classes = useStyles();
    const canvasRef = useRef(null);
    const minSlice = getMinSlice();
    const [maxDepth, maxWidth, maxHeight] = getMax();
    const drawXOffset = Math.floor((series.width - maxWidth) / 2);
    const drawYOffset = Math.floor((series.height - maxHeight) / 2);
    const [isHold, setIsHold] = useState(false);
    const [sliceX, sliceY, sliceZ] = getSliceNum();
    const scaleW = width / 512;
    const scaleH = height / 512;

    // const drawText = useCallback(drawTextOverlay, [sliceNum, props.view]);

    const isLoading = !!props.loading;

    function getSliceNum() {
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return [props.sliceCoords.x, props.sliceCoords.y, props.sliceCoords.z]
            case 'CORONAL':
                return [props.sliceCoords.x, props.sliceCoords.z, props.sliceCoords.y]
            case 'SAGITTAL':
                return [props.sliceCoords.y, props.sliceCoords.z, props.sliceCoords.x]
            default:
                return [0, 0, 0];
        }
    }

    function getMinSlice() {
        if (series.position == null) return;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return series.position[2]
            case 'CORONAL':
                return series.position[1]
            case 'SAGITTAL':
                return series.position[0]
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
                return [series.height, series.width, (series.depth - 1) * series.thickness + 1];
            case 'SAGITTAL':
                return [series.width, series.height, (series.depth - 1) * series.thickness + 1];
            default:
                return 1;
        }
    }

    function drawCrosshairs(x, y) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
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
                    return -series.thickness;
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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(props.view.toUpperCase(), width / 2, 24);
        ctx.fillText(`Slice Position: ${(sliceZ * getSpacing() + minSlice).toFixed(4)}mm`, width / 2, height - 12);
    }

    function handleUserKeyPress(e) {
        if (series == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            // Increments forward
            props.handleSlice(props.view, sliceX, sliceY, sliceZ > 0 ? sliceZ - 1 : 0);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            // Increments backward
            props.handleSlice(props.view, sliceX, sliceY, sliceZ < maxDepth - 1 ? sliceZ + 1 : maxDepth - 1);
        }
    }

    function handleUserScroll(e) {
        if (series == null) return;
        const direction = e.deltaY;
        if (direction > 0) {
            // On scroll down
            props.handleSlice(props.view, sliceX, sliceY, sliceZ < maxDepth - 1 ? sliceZ + 1 : maxDepth - 1);
        } else if (direction < 0) {
            // On scroll up
            props.handleSlice(props.view, sliceX, sliceY, sliceZ > 0 ? sliceZ - 1 : 0);
        }
    }

    function handleCrosshair(e, override = false) {

        if ((!isHold && !override) || series == null) return;
        const rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        switch (view.toUpperCase()) {
            case 'CORONAL':
            case 'SAGITTAL':
                props.handleSlice(props.view, Math.round((x - drawXOffset) / scaleW), Math.round((y - drawYOffset) / series.thickness / scaleH), sliceZ);
                break;
            default:
                props.handleSlice(props.view, Math.round((x - drawXOffset) / scaleW), Math.round((y - drawYOffset) / scaleH), sliceZ);

        }
        // props.handleSlice(props.view, x - drawXOffset, y - drawYOffset, sliceZ);
    }

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        drawTextOverlay();
        // drawCrosshairs(sliceX + drawXOffset, sliceY + drawYOffset);
        switch (view.toUpperCase()) {
            case 'CORONAL':
            case 'SAGITTAL':
                drawCrosshairs(sliceX * scaleW + drawXOffset, sliceY * series.thickness * scaleH + drawYOffset)
                break;
            default:
                drawCrosshairs(sliceX * scaleW + drawXOffset, sliceY * scaleH + drawYOffset)

        }
    }, [sliceX, sliceY, sliceZ, scaleW, scaleH])


    return (
        <div
            className={classes.canvasContainer}
            style={{ width: width, height: height }}
        >
            <CTLayer
                sliceNum={sliceZ}
                series={props.series}
                view={props.view}
                width={width}
                height={height}
            ></CTLayer>
            <RDLayer
                sliceNum={sliceZ}
                rds={props.rd}
                view={props.view}
                canvasOffset={[drawXOffset, drawYOffset]}
                width={width}
                height={height}
            ></RDLayer>
            <OverlayLayer
                sliceNum={sliceZ}
                rs={props.rs}
                view={props.view}
                minSlice={minSlice}
                selected={props.selected}
                canvasOffset={[drawXOffset, drawYOffset]}
                width={width}
                height={height}
            ></OverlayLayer>
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
                width={width}
                height={height}
            >
            </canvas>
            {series == null || Object.keys(series).length === 0 || isLoading ? <div className={classes.loading}>
                <CircularProgress color='primary'></CircularProgress>
            </div> : null}
        </div>
    );
}

export default CTCanvas;