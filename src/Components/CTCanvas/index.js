import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { readDir } from '../../Utilities/fileHandler';


const useStyles = makeStyles((theme) => ({

}));


function CTCanvas() {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const [series, setSeries] = useState();

    function initCanvas() {
        readDir('CT', true).then(fileData => {

            // drawCT(fileData['CT'][0])
            let series = fileData['SERIES'];
            canvasRef.current.height = series.images[0].getRows();
            canvasRef.current.width = series.images[0].getCols();
            drawCT(series.images[0])
        })
    }

    function canvasReset() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function drawCT(image) {
        canvasReset();
        const ctx = canvasRef.current.getContext('2d');
        let imgData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
        let data = imgData.data;

        let obj = image.getInterpretedData(false, true);
        let array = new Uint8ClampedArray(obj.data);
        console.log(array)

        let temp = 0
        for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
            //convert 16-bit to 8-bit, because we cannot render a 16-bit value to the canvas.
            let result = ((array[k + 1] & 0xFF) << 8) | (array[k] & 0xFF);
            result = (result & 0xFFFF) >> 8;
            data[i] = 255 - result;
            temp = k;
        }
        console.log(temp)

        ctx.putImageData(imgData, 0, 0);
    }

    useEffect(initCanvas, []);


    return (
        <canvas
            ref={canvasRef}
        >
        </canvas>
    );
}

export default CTCanvas;