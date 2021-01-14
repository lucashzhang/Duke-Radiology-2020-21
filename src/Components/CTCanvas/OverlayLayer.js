import React, { useMemo, useRef, useEffect } from 'react';

function CTLayer(props) {

    const canvasRef = useRef(null);
    const sliceNum = props.sliceNum;
    const view = props.view;
    const rs = props.rs;
    const minSlice = props.minSlice;
    const contours = useMemo(getSelectedContours, [rs, props.selected, sliceNum]);

    function getSelectedContours() {
        if (rs.getSpecificContours == null) return null;
        return rs.getSpecificContours(props.selected);
    }

    function createContourPoints() {
        if (rs.getContourAtZ == null) return null;
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

    function drawContour(contourData = null) {
        if (contourData == null || Object.keys(contourData).length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0,0,512,512)
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

    useEffect(() => {
        drawContour(createContourPoints());
    }, [rs, sliceNum, contours])

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