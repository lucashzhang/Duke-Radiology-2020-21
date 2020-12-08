import React, { useEffect, useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { List, ListItem, ListItemText } from '@material-ui/core';

import { readDir } from '../../Utilities/fileHandler.js';



const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: 'calc(270px)',
        height: 'calc(100vh)',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.paper,
        overflow: 'auto'
    }
}));


function FileDrawer() {

    const classes = useStyles();

    const [structs, setStructs] = useState([]);

    function genStructList() {
        readDir('RS').then(fileData => {
            let newStructs = fileData['RS'][0].structList;
            setStructs(newStructs);
        });
    }

    useEffect(genStructList, []);


    return (
        <ThemeProvider theme={theme}>
            <div className={classes.drawerContainer}>
                <List>
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