import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';

import { readDir } from '../../Utilities/fileHandler';
import { setFolderDirectory } from '../../Redux/actions';

const useStyles = makeStyles((theme) => ({
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
    const dirPath = useSelector(state => state.directory.folderDirectory);

    function genStructList() {
        if (dirPath === '' || dirPath == null) return;
        readDir(dirPath).then(fileData => {
            let newStructs = fileData['RS'][0].structList;
            let newSeries = fileData['SERIES']
            console.log(newSeries)
            setStructs(newStructs);
            setSeries(newSeries);
        });
    }

    function initPath() {
        dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01'))
    }

    useEffect(initPath, []);
    useEffect(genStructList, [dirPath]);

    return (
        <div className={classes.frame}>
            <StructMenu structs={structs}></StructMenu>
            <div className={classes.viewport}>
                <CTCanvas image={series ? series.images[0] : null}></CTCanvas>
            </div>
        </div>
    );
}

export default Dashboard;
