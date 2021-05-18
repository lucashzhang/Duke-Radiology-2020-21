import React, { useRef, useEffect } from 'react';
import * as colormap from 'colormap';

const jet = colormap({
    colormap: 'jet',
    nshades: 9,
    format: 'rgba',
    alpha: 1
});

function RDLayer(props) {

    const canvasRef = useRef(null);
    const offscreenRef = useRef(new OffscreenCanvas(512,512));
    const { sliceNum, view, rds, canvasOffset } = props;

    useEffect(() => {

        function drawDoseOverlay(rd) {

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

            function colorFilter(doseVal) {
                const adjusted = Math.max(0, Math.floor(doseVal / rd.maxDose * 10) - 2);
                if (adjusted === 0) return [0,0,0,0];
                return jet[Math.min(adjusted, jet.length - 1)]
            }
            if (rd == null || rd.imageArray == null || canvasOffset == null || rd.offsetVector == null) return;
            let pixelArray;
            const [maxWidth, maxHeight] = getMax();
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    pixelArray = rd.getAxialSlice(sliceNum, colorFilter, 180);
                    break;
                case 'CORONAL':
                    pixelArray = rd.getCoronalSlice(sliceNum, colorFilter, 180);
                    break;
                case 'SAGITTAL':
                    pixelArray = rd.getSagittalSlice(sliceNum, colorFilter, 180);
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

        rds?.forEach(rd => drawDoseOverlay(rd));
        const ctx = canvasRef.current.getContext('2d');

        return function cleanup() {
            ctx.clearRect(0, 0, 512, 512);
        }
    }, [rds, sliceNum, canvasOffset, view])

    return (
        <canvas
            ref={canvasRef}
            width={512}
            height={512}
            style={{ position: 'absolute' }}
        ></canvas>
    )
}


export default RDLayer;