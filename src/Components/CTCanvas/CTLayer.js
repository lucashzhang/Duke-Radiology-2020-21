import React, { useEffect, useRef } from 'react';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;
    const series = props.series;
    const view = props.view;

    function buildCTCanvas() {

        function createImageData(imgArray) {
            if (imgArray == null) return null;
            const ctx = canvasRef.current.getContext('2d');
            // Create new image data object
            let imgData = ctx.createImageData(maxWidth, maxHeight);
            let data = imgData.data;
            // Fill image data object
            for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
                data[i - 3] = data[i - 2] = data[i - 1] = imgArray[k];
                data[i] = 255;
            }
            // setImgData(imgData)
            return imgData;
        }
    
        function getMax() {
            if (series == null) return [512, 512];
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    return [series.width, series.height];
                case 'CORONAL':
                    return [series.width, series.depth];
                case 'SAGITTAL':
                    return [series.height, series.depth];
                default:
                    return [512, 512];
            }
        }

        if (canvasRef.current == null || series == null || series.getAxialSlice == null) return;
        // const ctSeries = new CTSeries(series);
        let imgData;
        const [maxWidth, maxHeight] = getMax();
        const drawXOffset = Math.floor((series.width - maxWidth) / 2);
        const drawYOffset = Math.floor((series.height - maxHeight) / 2);

        canvasRef.current.width = series.width;
        canvasRef.current.height = series.height;
        switch (view.toUpperCase()) {
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
                return;
        }
        const ctx = canvasRef.current.getContext('2d');
        ctx.putImageData(imgData, drawXOffset, drawYOffset);
    }

    useEffect(buildCTCanvas, [series, sliceNum])

    return (
        <canvas
            ref={canvasRef}
            width={512}
            height={512}
            style={{ position: 'absolute'}}
        ></canvas>
    )
}


export default CTLayer;