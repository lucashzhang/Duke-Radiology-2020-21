import React, { useEffect, useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { List, ListItem, ListItemText } from '@material-ui/core';

import { readDir } from '../../Utilities/fileHandler.js';



const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: 'calc(270px - 2rem)',
        height: 'calc(100vh - 2rem)',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.paper,
        padding: '1rem',
        overflow: 'auto'
    }
}));


function FileDrawer() {

    const classes = useStyles();

    const [isClickable, setIsClickable] = useState(true);
    const [structs, setStructs] = useState([]);

    useEffect(() => readDir(), []);


    return (
        <ThemeProvider theme={theme}>
            <div className={classes.drawerContainer}>
                <List onMouseEnter={() => setIsClickable(false)} onMouseLeave={() => setIsClickable(true)}>
                    {
                        structs.map((struct, index) => (
                            <ListItem button key={`${struct.name}${struct.roi}`}>
                                <ListItemText primary={struct.name} />
                            </ListItem>
                        ))
                    }
                </List>
            </div>
        </ThemeProvider>
    );
}

export default FileDrawer;