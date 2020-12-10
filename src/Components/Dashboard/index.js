import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';

import { readDir } from '../../Utilities/fileHandler';
import { setFolderDirectory } from '../../Redux/actions';

const useStyles = makeStyles(() => ({
    frame: {
        display: 'flex',
        flexDirection: 'row'
    },
    viewport: {
        width: 'calc(100vw - 270px)',
        height: '100vh',
    }
}));

function Dashboard() {
    const classes = useStyles();
    const dispatch = useDispatch();

    const [structs, setStructs] = useState([]);
    const [series, setSeries] = useState(null);
    const dirPath = useSelector(state => state.directory.folderDirectory, shallowEqual);

    function genStructList() {
        if (dirPath === '' || dirPath == null) return;
        readDir(dirPath).then(fileData => {
            setStructs(fileData['RS'][0].structList);
            setSeries(fileData['SERIES']);
        });
    }

    function initPath() {
        dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/02'))
    }

    useEffect(initPath, []);
    useEffect(genStructList, [dirPath]);

    return (
        <div className={classes.frame}>
            <StructMenu structs={structs}></StructMenu>
            <div className={classes.viewport}>
                <CTCanvas series={series} view='AXIAL'></CTCanvas>
            </div>
        </div>
    );
}

export default Dashboard;
