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
    const [sliceNum, setSliceNum] = useState(0);

    function drawCanvas() {
        if (props.images) drawCT(props.images[sliceNum])
    }

    function canvasReset() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function drawCT(image) {
        canvasReset();
        const ctx = canvasRef.current.getContext('2d');
        // Get new image data and size canvas accordingly
        let ctImg = image.getInterpretedData(false, true);
        let array = new Uint8ClampedArray(ctImg.data);
        canvasRef.current.width = ctImg.numCols;
        canvasRef.current.height = ctImg.numRows;
        // Create new image data object
        let imgData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
        let data = imgData.data;
        // Fill image data object
        for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
            //convert 16-bit to 8-bit, because we cannot render a 16-bit value to the canvas.
            // let result = ((array[k + 1] & 0xFF) << 8) | (array[k] & 0xFF);
            // result = (result & 0xFFFF) >> 8;
            // data[i] = 255 - result;

            data[i] = 255 - array[k]
        }
        // set image data object
        ctx.putImageData(imgData, 0, 0);
    }

    function handleUserKeyPress(e) {
        if (props.images == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            // Increments forward
            setSliceNum(prevState => prevState < props.images.length - 1 ? prevState + 1 : props.images.length - 1);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            // Increments backward
            setSliceNum(prevState => prevState > 0 ? prevState - 1 : 0);
        }
    }

    function handleUserScroll(e) {
        const direction = e.deltaY;
        if (direction > 0) {
            // On scroll down
            setSliceNum(prevState => prevState > 0 ? prevState - 1 : 0);
        } else if (direction < 0) {
            // On scroll up
            setSliceNum(prevState => prevState < props.images.length - 1 ? prevState + 1 : props.images.length - 1);
        }
    }

    useEffect(drawCanvas, [props.images, sliceNum]);

    return (
        <canvas
            ref={canvasRef}
            className={classes.canvas}
            onKeyDown = {handleUserKeyPress}
            onWheel = {handleUserScroll}
            tabIndex="0"
        >
        </canvas>
    );
}

export default CTCanvas;