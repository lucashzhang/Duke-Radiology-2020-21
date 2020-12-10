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
    let sliceDepth = 1;
    const [sliceNum, setSliceNum] = useState(0);

    function drawCanvas() {
        if (props.series == null) return;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.height;
                sliceDepth = series.depth;
                drawCT(series.getAxialSlice(sliceNum));
                break;
            case 'CORONAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.depth;
                sliceDepth = series.height;
                drawCT(series.getCoronalSlice(sliceNum));
                break;
            case 'SAGITTAL':
                canvasRef.current.width = series.depth;
                canvasRef.current.height = series.height;
                sliceDepth = series.width;
                drawCT(series.getSagittalSlice(sliceNum));
                break;
            default:
                break;
        }
    }

    function canvasReset() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function drawCT(imgArray) {
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

    function handleUserKeyPress(e) {
        if (props.series == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            // Increments forward
            setSliceNum(prevState => prevState < sliceDepth - 1 ? prevState + 1 : sliceDepth - 1);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            // Increments backward
            setSliceNum(prevState => prevState > 0 ? prevState - 1 : 0);
        }
    }

    function handleUserScroll(e) {
        if (props.series == null) return;
        const direction = e.deltaY;
        if (direction > 0) {
            // On scroll down
            setSliceNum(prevState => prevState > 0 ? prevState - 1 : 0);
        } else if (direction < 0) {
            // On scroll up
            setSliceNum(prevState => prevState < sliceDepth - 1 ? prevState + 1 : sliceDepth - 1);
        }
    }

    useEffect(drawCanvas, [series, sliceNum]);

    return (
        <canvas
            ref={canvasRef}
            className={classes.canvas}
            onKeyDown={handleUserKeyPress}
            onWheel={handleUserScroll}
            tabIndex="0"
        >
        </canvas>
    );
}

export default CTCanvas;