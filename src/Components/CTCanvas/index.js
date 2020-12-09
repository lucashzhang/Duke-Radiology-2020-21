import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { readDir } from '../../Utilities/fileHandler';


const useStyles = makeStyles((theme) => ({

}));


function CTCanvas() {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const [ctData, setCTData] = useState();

    function initCanvas() {
        readDir('CT').then(fileData => {
            setCTData(fileData['CT']);
            canvasRef.current.height = fileData['CT'][0].rows;
            canvasRef.current.width = fileData['CT'][0].columns;

            drawCT(fileData['CT'][0])
        })
    }

    function canvasReset() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function drawCT(ct) {
        canvasReset();
        const ctx = canvasRef.current.getContext('2d');
        let imgData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
        let newData = ct.pixelData;
        let data = imgData.data;

        for (var i = 0; i < data.length; i+=4) {
            data[i] = data[i+1] = data[i+2] = data[i+3] = newData[Math.floor(i / 2)];
            data[i+3] = 255;
        }

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