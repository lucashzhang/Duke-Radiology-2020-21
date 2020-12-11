import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    canvas: {
        cursor: 'pointer'
    }
}));


function CTCanvas(props) {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const series = props.series;
    const sliceNum = props.sliceNum;

    const [imgArray, setImgArray] = useState(new Uint8ClampedArray([]));
    const [maxSlices, setMaxSlices] = useState(1);
    const [equiv, setEquiv] = useState({ x: '', y: '', z: '' });
    const [isHold, setIsHold] = useState(false);

    function buildCTCanvas() {
        if (series == null) return;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.height;
                setMaxSlices(series.depth);
                setImgArray(series.getAxialSlice(sliceNum));
                break;
            case 'CORONAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.depth;
                setMaxSlices(series.height);
                setImgArray(series.getCoronalSlice(sliceNum));
                break;
            case 'SAGITTAL':
                canvasRef.current.width = series.depth;
                canvasRef.current.height = series.height;
                setMaxSlices(series.width);
                setImgArray(series.getSagittalSlice(sliceNum));
                break;
        }
        setEquiv(getCoordEquiv())
    }

    function getCoordEquiv() {
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return { x: 'X', y: 'Y', z: 'Z' }
            case 'CORONAL':
                return { x: 'X', y: 'Z', z: 'Y' }
            case 'SAGITTAL':
                return { x: 'Z', y: 'Y', z: 'X' }
            default:
                return { x: '', y: '', z: '' }
        }
    }

    function canvasReset() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function drawCanvas() {
        canvasReset();
        const ctx = canvasRef.current.getContext('2d');
        // Create new image data object
        let imgData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
        let data = imgData.data;
        // Fill image data object
        for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
            //convert 16-bit to 8-bit, because we cannot render a 16-bit value to the canvas.
            // let result = ((array[k + 1] & 0xFF) << 8) | (array[k] & 0xFF);
            // result = (result & 0xFFFF) >> 8;
            // data[i] = 255 - result;

            data[i] = 255 - imgArray[k]
        }
        // set image data object
        ctx.putImageData(imgData, 0, 0);
    }

    function drawCrosshairs(x, y) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasRef.current.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.current.width, y);
        ctx.stroke();
    }

    function handleUserKeyPress(e) {
        if (props.series == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            // Increments forward
            props.handleSlice(equiv.z, props.sliceNum < maxSlices - 1 ? props.sliceNum + 1 : maxSlices - 1);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            // Increments backward
            props.handleSlice(equiv.z, props.sliceNum > 0 ? props.sliceNum - 1 : 0);
        }
    }

    function handleUserScroll(e) {
        if (props.series == null) return;
        const direction = e.deltaY;
        if (direction > 0) {
            // On scroll down
            props.handleSlice(equiv.z, props.sliceNum > 0 ? props.sliceNum - 1 : 0);
        } else if (direction < 0) {
            // On scroll up
            props.handleSlice(equiv.z, props.sliceNum < maxSlices - 1 ? props.sliceNum + 1 : maxSlices - 1);
        }
    }

    function handleClick(e) {
        if (!isHold) return;
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        props.handleSlice(equiv.x, x);
        props.handleSlice(equiv.y, y);
        drawCanvas();
        drawCrosshairs(x, y);
    }

    useEffect(buildCTCanvas, [series, props.view, props.sliceNum]);
    useEffect(drawCanvas, [imgArray]);

    return (
        <canvas
            ref={canvasRef}
            className={classes.canvas}
            onKeyDown={handleUserKeyPress}
            onWheel={handleUserScroll}
            onMouseDown={() => setIsHold(true)}
            onMouseUp={() => setIsHold(false)}
            onMouseLeave={() => setIsHold(false)}
            onMouseMove={handleClick}
            tabIndex="0"
        >
        </canvas>
    );
}

export default CTCanvas;