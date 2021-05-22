import React, { useEffect, useRef } from 'react';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const { sliceNum, series, view, width, height } = props;
    const offscreenRef = useRef(new OffscreenCanvas(512, 512));

    function buildCTCanvas() {

        function getMax() {
            if (series == null) return [512, 512];
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    return [series.width, series.height, series.height];
                case 'CORONAL':
                    return [series.width, (series.depth - 1) * series.thickness + 1, series.depth];
                case 'SAGITTAL':
                    return [series.height, (series.depth - 1) * series.thickness + 1, series.depth];
                default:
                    return [512, 512];
            }
        }
        if (canvasRef.current == null || series == null || series.getAxialSlice == null) return;
        // const ctSeries = new CTSeries(series);
        let imgData;
        const [maxWidth, maxHeight, trueHeight] = getMax();
        const drawXOffset = Math.floor((series.width - maxWidth) / 2);
        const drawYOffset = Math.floor((series.height - maxHeight) / 2);
        const scaleW = width / 512;
        const scaleH = height / 512;
        canvasRef.current.width = series.width * scaleW;
        canvasRef.current.height = series.height * scaleH;
        offscreenRef.current.width = maxWidth;
        offscreenRef.current.height = trueHeight;
        switch (view.toUpperCase()) {
            case 'AXIAL':
                imgData = series.getAxialSlice(sliceNum);
                break;
            case 'CORONAL':
                imgData = series.getCoronalSlice(sliceNum);
                break;
            case 'SAGITTAL':
                imgData = series.getSagittalSlice(sliceNum);
                break;
            default:
                return;
        }
        if (imgData == null || canvasRef.current == null) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        offscreenRef.current.getContext('2d').putImageData(imgData, 0, 0);
        ctx.drawImage(offscreenRef.current, drawXOffset * scaleW, drawYOffset * scaleH, maxWidth * scaleW, maxHeight * scaleH);
    }

    useEffect(buildCTCanvas, [series, sliceNum, width, height])

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ position: 'absolute' }}
        ></canvas>
    )
}


export default CTLayer;