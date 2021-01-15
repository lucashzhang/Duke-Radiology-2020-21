import React, { useRef, useEffect } from 'react';
import { RD } from '../../Backend/fileObjects';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const { sliceNum, selected, view, rs, rd, minSlice } = props

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
                        ctx.fillRect(point[0] - 0.25, point[1] - 0.25, 2, 2);
                    }
                }
            }
        }

        function createContourPoints() {
            if (rs.getContourAtZ == null) return null;
            const contours = getSelectedContours()
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    return rs.getContourAtZ(contours, Math.floor(sliceNum / rs.imageThickness) * rs.imageThickness + minSlice);
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
            if (rd.imageArray == null) return;
            let pixelArray;
            switch (view.toUpperCase()) {
                case 'AXIAL':
                    pixelArray = rd.getAxialSlice(sliceNum);
                    break;
                case 'CORONAL':
                    break;
                case 'SAGITTAL':
                    break;
                default:
                    return;
            }

            if (pixelArray == null || pixelArray.length === 0) return;
            const ctx = canvasRef.current.getContext('2d');
            // Create new image data object
            let imgData = ctx.createImageData(rd.width, rd.height);
            let data = imgData.data;
            // Fill image data object
            for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
                data[i - 3] = data[i - 2] = data[i - 1] = pixelArray[k] * rd.doseGridScaling * 255;
                data[i] = pixelArray[k] === 0 ? 0 : 100;
            }
            // setImgData(imgData)
            ctx.putImageData(imgData, -rd.offsetVector[0], -rd.offsetVector[1]);

        }

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);
        drawDoseOverlay();
        drawContour(createContourPoints());
    }, [rs, rd, sliceNum, selected])

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