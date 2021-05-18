import React, { useRef, useEffect } from 'react';
import { useSelector, shallowEqual } from "react-redux";

function CTLayer(props) {

    const canvasRef = useRef(null);
    const { sliceNum, view, rs, minSlice, canvasOffset } = props;
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

        drawContour(createContourPoints());
        return function cleanup() {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, 512, 512);
        }
    }, [rs, sliceNum, structures, canvasOffset])

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