import React, { useEffect, useRef } from 'react';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;
    const series = props.series;
    const view = props.view;
    const offscreenRef = useRef(new OffscreenCanvas(512,512));


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

        canvasRef.current.width = series.width;
        canvasRef.current.height = series.height;
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
        if (imgData == null) return;
        offscreenRef.current.getContext('2d').putImageData(imgData, 0, 0);
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(offscreenRef.current, drawXOffset, drawYOffset, maxWidth, maxHeight);

        return function cleanup() {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, 512, 512);
        }
    }

    useEffect(buildCTCanvas, [series, sliceNum])

    return (
        <canvas
            ref={canvasRef}
            width={512}
            height={512}
            style={{ position: 'absolute' }}
        ></canvas>
    )
}


export default CTLayer;