import React, { useRef, useEffect } from 'react';
import * as colormap from 'colormap';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const offscreenRef = useRef(new OffscreenCanvas(512,512));
    const { sliceNum, selected, view, rs, rd, minSlice, canvasOffset, isDose } = props;

    function colorFilter(doseVal) {
        const adjusted = Math.max(0, Math.floor(doseVal / rd.maxDose * 10) * 10 - 20);
        if (adjusted === 0) return [0,0,0,0];
        return rd.colors[Math.min(adjusted, rd.colors.length - 1)]
    }

    useEffect(() => {
        function getSelectedContours() {
            if (rs.getSpecificContours == null || selected.length === 0) return null;
            return rs.getSpecificContours(props.selected);
        }

        function drawContour(contourData = null) {
            const ctx = canvasRef.current.getContext('2d');
            if (contourData == null || Object.keys(contourData).length === 0) return;
            for (let roi in contourData) {
                const color = contourData[roi].displayColor
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                for (let sequence of contourData[roi].sequences) {
                    for (let point of sequence.contours) {
                        ctx.fillRect(point[0] - 0.5, point[1] - 0.5, 2, 2);
                    }
                }
            }
        }

        function createContourPoints() {
            if (rs.getContourAtZ == null) return null;
            const contours = getSelectedContours()
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    return rs.getContourAtZ(contours, minSlice - sliceNum * rs.imageThickness);
                case 'CORONAL':
                    break;
                case 'SAGITTAL':
                    break;
                default:
                    break;
            }
            return {};
        }

        function drawDoseOverlay() {

            function imgOffset() {

                switch (view.toUpperCase()) {
                    case 'AXIAL':
                        return [-rd.offsetVector[0] + canvasOffset[0], -rd.offsetVector[1] + canvasOffset[1]]
                    case 'CORONAL':
                        return [-rd.offsetVector[0] + canvasOffset[0], -rd.offsetVector[2] + canvasOffset[1]]
                    case 'SAGITTAL':
                        return [-rd.offsetVector[1] + canvasOffset[0], -rd.offsetVector[2] + canvasOffset[1]]
                    default:
                        return [0, 0];
                }
            }

            function getMax() {
                if (rd == null) return [512, 512];
                switch (view.toUpperCase()) {
                    case 'AXIAL':
                        return [rd.width, rd.height];
                    case 'CORONAL':
                        return [rd.width, rd.depth];
                    case 'SAGITTAL':
                        return [rd.height, rd.depth];
                    default:
                        return [512, 512];
                }
            }
            
            if (rd.imageArray == null || canvasOffset == null || rd.offsetVector == null) return;
            let pixelArray;
            const [maxWidth, maxHeight] = getMax();
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    pixelArray = rd.getAxialSlice(sliceNum, colorFilter);
                    break;
                case 'CORONAL':
                    pixelArray = rd.getCoronalSlice(sliceNum, colorFilter);
                    break;
                case 'SAGITTAL':
                    pixelArray = rd.getSagittalSlice(sliceNum, colorFilter);
                    break;
                default:
                    return;
            }

            if (pixelArray == null || pixelArray.length === 0) return;
            const ctx = canvasRef.current.getContext('2d');
            offscreenRef.current.width = pixelArray.width;
            offscreenRef.current.height = pixelArray.height;
            offscreenRef.current.getContext('2d').putImageData(pixelArray, 0, 0);
            const offsets = imgOffset();
            ctx.drawImage(offscreenRef.current, offsets[0], offsets[1], maxWidth, maxHeight)

        }

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);
        if (!!isDose) drawDoseOverlay();
        drawContour(createContourPoints());
    }, [rs, rd, sliceNum, selected, canvasOffset, isDose])

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