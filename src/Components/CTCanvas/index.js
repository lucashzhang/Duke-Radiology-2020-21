import React, { useState, useRef, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

const useStyles = makeStyles(() => ({
    canvasContainer: {
        display: 'grid',
        gridTemplateColumns: '2rem 1fr 2rem',
        gridTemplateRows: '2rem 1fr 2rem',
    },
    canvasTitle: {
        gridColumn: '2',
        gridRow: '1',
        color: 'white',
        zIndex: '10',
        padding: '4px',
        textAlign: 'center'
    },
    canvas: {
        cursor: 'pointer',
        gridColumn: '1 / 4',
        gridRow: '1 / 4',
    }
}));


function CTCanvas(props) {

    const classes = useStyles();
    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;
    const series = props.series;
    const maxSlices = getMaxSlices();
    const maxWidth = getMaxWidth();
    const maxHeight = getMaxHeight();
    const xOffset = Math.round((series.width - maxWidth) / 2)
    const yOffset = Math.round((series.height - maxHeight) / 2);
    const equiv = getCoordEquiv();

    const rs = props.rs;
    const contours= getSelectedContours();
    const slicedContours = createContourPoints();

    const drawText = useCallback(drawTextOverlay, [props.sliceNum, props.view])
    const drawCT = useCallback(drawCanvas, [drawText, xOffset, yOffset, slicedContours, drawContour]);
    // const imgData = useMemo(buildCTCanvas, [series, props.view, sliceNum, drawCT, canvasRef, maxHeight, maxWidth]);
    const imgData = useMemo(buildCTCanvas);
    const [isHold, setIsHold] = useState(false);


    function buildCTCanvas() {

        function createImageData(imgArray) {
            if (imgArray == null) return null;
            const ctx = canvasRef.current.getContext('2d');
            // Create new image data object
            let imgData = ctx.createImageData(maxWidth, maxHeight);
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

        if (series == null || series.getAxialSlice == null || canvasRef.current == null) return;
        // const ctSeries = new CTSeries(series);
        let imgData = null;
        canvasRef.current.width = series.width;
        canvasRef.current.height = series.height;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                imgData = createImageData(series.getAxialSlice(sliceNum));
                break;
            case 'CORONAL':
                imgData = createImageData(series.getCoronalSlice(sliceNum));
                break;
            case 'SAGITTAL':
                imgData = createImageData(series.getSagittalSlice(sliceNum));
                break;
            default:
                imgData = null;
        }
        return imgData;

    }

    function getSelectedContours() {
        if (rs.getSpecificContours == null) return null;
        return rs.getSpecificContours(props.selected);
    }

    function createContourPoints() {
        if (rs.getContourAtZ == null) return null;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return rs.getContourAtZ(contours, sliceNum + series.minZ);
            case 'CORONAL':
                break;
            case 'SAGITTAL':
                break;
            default:
                break;
        }
        return {};
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

    function getMaxWidth() {
        if (series == null) return 512;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return series.width;
            case 'CORONAL':
            case 'SAGITTAL':
                return series.width;
            default:
                return 512;
        }
    }

    function getMaxHeight() {
        if (series == null) return 512;
        switch (props.view.toUpperCase()) {
            case 'AXIAL':
                return series.height;
            case 'CORONAL':
            case 'SAGITTAL':
                return series.depth;
            default:
                return 512;
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
                return { x: 'Y', y: 'Z', z: 'X' }
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
        ctx.putImageData(data, xOffset, yOffset);
        drawContour(slicedContours)
        drawText();
    }

    function drawContour(contourData = null) {
        if (contourData == null || Object.keys(contourData).length == 0) return;
        const ctx = canvasRef.current.getContext('2d');
        for (let roi in contourData) {
            console.log(contourData[roi])
        }
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

    function drawTextOverlay() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = '16px sans-serif';
        ctx.textAlign = "center";
        ctx.fillStyle = "#00FFFF";
        ctx.fillText(props.view.toUpperCase(), 256, 24);
        ctx.fillText(`Slice Number: ${props.sliceNum + 1}`, 256, 500);
    }

    function handleUserKeyPress(e) {
        if (series == null) return;
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
        if (series == null) return;
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
        if ((!isHold && !override) || series == null) return;
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        props.handleSlice(equiv.x, x - xOffset);
        props.handleSlice(equiv.y, y - yOffset);
        canvasReset();
        drawCT(imgData);
        drawCrosshairs(x, y);
    }


    return (
        <div
            className={classes.canvasContainer}
        >
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
        </div>
    );
}

export default CTCanvas;