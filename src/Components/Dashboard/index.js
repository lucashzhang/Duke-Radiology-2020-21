import React from "react";
import FileDrawer from '../Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CTCanvas from '../CTCanvas';

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
    return (
        <div className = {classes.frame}>
            <FileDrawer></FileDrawer>
            <div className={classes.viewport}>
                <CTCanvas></CTCanvas>
            </div>
        </div>
    );
}

export default Dashboard;
