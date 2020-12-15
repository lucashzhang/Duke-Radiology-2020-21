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

    const [checked, setChecked] = useState(null);

    function initChecks() {
        let checkBoxes = {};
        for (let struct of structs) {
            checkBoxes[struct.roi] = false;
        }
        setChecked(checkBoxes)
    }

    function toggleChecked(roi) {
        const newState = { ...checked, [roi]: !checked[roi] }
        setChecked(newState);
        let res = [];
        Object.keys(newState).forEach((key) => {
            if (newState[key]) res.push(Number(key))
        })
        props.handleChecked(res);
    }

    useEffect(initChecks, [structs]);

    return (
        <div className={classes.drawerContainer}>
            {checked != null && Object.keys(checked).length !== 0 ? <List>
                {
                    structs.map((struct) => (
                        <ListItem key={`${struct.name}${struct.roi}`}>
                            <FormControlLabel
                                control={<Checkbox name={`${struct.roi}`} checked={checked[struct.roi]} onChange={() => toggleChecked(struct.roi)} />}
                                label={struct.name}
                            />
                        </ListItem>
                    ))
                }

            </List> : null}
        </div>
    );
}

export default StructMenu;