import React, { useEffect, useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { List, ListItem, ListItemText } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: 'calc(270px)',
        height: 'calc(100vh)',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.paper,
        overflow: 'auto'
    }
}));


function StructMenu(props) {

    const classes = useStyles();
    const structs = props.structs;

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.drawerContainer}>
                <List>
                    {
                        structs.map((struct) => (
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

export default StructMenu;