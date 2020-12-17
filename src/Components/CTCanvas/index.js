import React, { useState, useRef, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { shallowEqual, useSelector } from "react-redux";
import { CTSeries } from '../../Backend/fileObjects';
// import { useDebounce } from '../../Utilities/customHooks';
import theme from '../../Utilities/theme';

const useStyles = makeStyles(() => ({
    canvas: {
        cursor: 'pointer'
    }
}));


function CTCanvas(props) {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;

    // const [imgArray, setImgArray] = useState(new Uint8ClampedArray([]));
    // const [imgData, setImgData] = useState(null);
    // const series = props.series;
    const series = useSelector(state => state.files.series, shallowEqual)
    const maxSlices = getMaxSlices();
    const equiv = getCoordEquiv();
    const [isHold, setIsHold] = useState(false);
    const drawCT = useCallback(drawCanvas, []);
    const imgData = useMemo(buildCTCanvas, [series, props.view, sliceNum, drawCT, canvasRef]);

    function buildCTCanvas() {

        function createImageData(imgArray) {
            if (imgArray == null) return null;
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

                // data[i] = 255 - imgArray[k];
                data[i - 3] = data[i - 2] = data[i - 1] = imgArray[k];
                data[i] = 255;
            }
            // setImgData(imgData)
            drawCT(imgData);
            return imgData;
        }

        function getAxialSlice(sliceNum) {
            return series.imageArray[sliceNum];
        }
    
        function getCoronalSlice(sliceNum) {
            let temp = [];
    
            for (let i = 0; i < series.depth; i++) {
                for (let j = 0; j < series.width; j++) {
                    temp.push(series.imageArray[i][sliceNum * series.width + j])
                }
            }
            return new Uint8ClampedArray(temp);
        }
    
        function getSagittalSlice(sliceNum) {
            let temp = [];
    
            for (let i = 0; i < series.height - 1; i++) {
                for (let j = 0; j < series.depth; j++) {
                    temp.push(series.imageArray[j][sliceNum + series.width * i]);
                }
            }
            return new Uint8ClampedArray(temp);
        }

        if (series == null || canvasRef.current == null) return;
        // const ctSeries = new CTSeries(series);
        let imgData = null;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.height;
                imgData = createImageData(getAxialSlice(sliceNum));
                break;
            case 'CORONAL':
                canvasRef.current.width = series.width;
                canvasRef.current.height = series.depth;
                imgData = createImageData(getCoronalSlice(sliceNum));
                break;
            case 'SAGITTAL':
                canvasRef.current.width = series.depth;
                canvasRef.current.height = series.height;
                imgData = createImageData(getSagittalSlice(sliceNum));
                break;
            default:
                imgData = null;
        }
        return imgData;

    }

    function getMaxSlices() {
        if (series == null) return 1;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return series.depth;
            case 'CORONAL':
                return series.height;
            case 'SAGITTAL':
                return series.width;
            default:
                return 1;
        }
    }

    function getCoordEquiv() {
        if (series == null) return;
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

    function drawCanvas(data = null) {
        if (data == null) return;

        canvasReset();
        const ctx = canvasRef.current.getContext('2d');
        ctx.putImageData(data, 0, 0);
    }

    function drawCrosshairs(x, y) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = theme.palette.secondary.light;
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

    function handleCrosshair(e, override = false) {
        if (!isHold && !override) return;
        let x = e.clientX - e.target.offsetLeft > 0 ? e.clientX - e.target.offsetLeft : 0;
        let y = e.clientY - e.target.offsetTop > 0 ? e.clientY - e.target.offsetTop : 0;
        props.handleSlice(equiv.x, x);
        props.handleSlice(equiv.y, y);
        drawCT(imgData);
        drawCrosshairs(x, y);
    }
    // useEffect(buildCTCanvas, [series, props.view, props.sliceNum]);
    // useEffect(drawCanvas, [imgData]);

    return (
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
        >
        </canvas>
    );
}

export default CTCanvas;