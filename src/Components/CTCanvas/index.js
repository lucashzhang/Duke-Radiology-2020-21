import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({

}));


function CTCanvas(props) {

    // const classes = useStyles();
    const canvasRef = useRef(null);

    function drawCanvas() {
        if (props.image) drawCT(props.image)
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

    useEffect(drawCanvas, [props.image]);


    return (
        <canvas
            ref={canvasRef}
        >
        </canvas>
    );
}

export default CTCanvas;