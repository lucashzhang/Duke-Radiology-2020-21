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
    const [imgNum, setImgNum] = useState(0);
    const dirPath = useSelector(state => state.directory.folderDirectory, shallowEqual);

    function genStructList() {
        if (dirPath === '' || dirPath == null) return;
        readDir(dirPath).then(fileData => {
            let newStructs = fileData['RS'][0].structList;
            let newSeries = fileData['SERIES']
            setStructs(newStructs);
            setSeries(fileData['SERIES']);
        });
    }

    function initPath() {
        dispatch(setFolderDirectory('/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01'))
    }

    function initKeyListener() {
        window.addEventListener('keydown', handleUserKeyPress);
        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    }

    function handleUserKeyPress(e) {
        if (series == null) return;
        const key = e.key.toUpperCase();

        if ((key === 'ARROWRIGHT' || key === 'ARROWUP')) {
            setImgNum(prevState => prevState < series.images.length - 1 ? prevState + 1 : series.images.length - 1);
        } else if ((key === 'ARROWLEFT' || key === 'ARROWDOWN')) {
            setImgNum(prevState => prevState > 0 ? prevState - 1 : 0);
        }
    }

    useEffect(initPath, []);
    useEffect(genStructList, [dirPath]);
    useEffect(initKeyListener, [series]);

    return (
        <div className={classes.frame}>
            <StructMenu structs={structs}></StructMenu>
            <div className={classes.viewport}>
                <CTCanvas image={series ? series.images[imgNum] : null}></CTCanvas>
            </div>
        </div>
    );
}

export default Dashboard;
