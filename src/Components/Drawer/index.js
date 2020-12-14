import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { List, ListItem, FormControlLabel, Checkbox } from '@material-ui/core';


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
        <div className={classes.drawerContainer}>
            <List>
                {
                    structs.map((struct) => (
                        <ListItem button key={`${struct.name}${struct.roi}`}>
                            <FormControlLabel
                                control={<Checkbox name={`${struct.roi}`} />}
                                label={struct.name}
                            />
                        </ListItem>
                    ))
                }
            </List>
        </div>
    );
}

export default StructMenu;