import React, { useRef, useEffect } from 'react';
import { useSelector, shallowEqual } from "react-redux";

function CTLayer(props) {

    const canvasRef = useRef(null);
    const { sliceNum, view, rs, minSlice, canvasOffset, width, height } = props;
    const scaleW = width / 512;
    const scaleH = height / 512;
    const structures = useSelector(state => state.selectionDrawer.selectedStructures, shallowEqual);


    useEffect(() => {
        function getSelectedContours() {
            const selected = Object.keys(structures)?.filter(struct => structures[struct])
            if (rs.getSpecificContours == null || selected == null || selected.length === 0) return null;
            return rs.getSpecificContours(selected);
        }

        function drawContour(contourData = null) {
            const ctx = canvasRef.current.getContext('2d');
            if (contourData == null || Object.keys(contourData).length === 0) return;
            for (let roi in contourData) {
                const color = contourData[roi].displayColor
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                for (let sequence of contourData[roi].sequences) {
                    for (let point of sequence.contours) {
                        ctx.fillRect(point[0] * scaleW, point[1] * scaleH, 2 * scaleW, 2 * scaleH);
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
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        drawContour(createContourPoints());
    }, [rs, sliceNum, structures, canvasOffset, width, height, scaleW, scaleH])

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