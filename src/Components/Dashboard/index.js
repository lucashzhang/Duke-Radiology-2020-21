import React, { useState, useEffect } from "react";
import StructMenu from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';

import { readDir } from '../../Utilities/fileHandler'

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

    const [structs, setStructs] = useState([]);
    const [series, setSeries] = useState(null)

    function genStructList() {
        readDir('ALL', true).then(fileData => {
            let newStructs = fileData['RS'][0].structList;
            let newSeries = fileData['SERIES']
            console.log(newSeries)
            setStructs(newStructs);
            setSeries(newSeries);
        });
    }

    useEffect(genStructList, []);

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
