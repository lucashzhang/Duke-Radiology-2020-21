import React, { useRef, useEffect } from 'react';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const { sliceNum, selected, view, rs, minSlice } = props

    useEffect(() => {
        function getSelectedContours() {
            if (rs.getSpecificContours == null || selected.length === 0) return null;
            return rs.getSpecificContours(props.selected);
        }

        function drawContour(contourData = null) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0,0,512,512);
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

        drawContour(createContourPoints());
    }, [rs, sliceNum, selected])

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