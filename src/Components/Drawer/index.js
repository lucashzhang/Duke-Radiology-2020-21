import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Paper, FormGroup, FormControlLabel, Checkbox, CircularProgress, FormControl, Divider, List, ListItem, Typography, Switch } from '@material-ui/core';
import theme from '../../Utilities/theme';


const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: 'calc(240px)',
        height: 'calc(100vh)',
        overflow: 'auto',
        // overflow: 'hidden',
        // transition: '0.5s',
        // '&:hover': {
        //     overflow: 'auto',
        //  },
    },
    loading: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));


function StructMenu(props) {

    const classes = useStyles();
    const structs = props.rs != null ? props.rs.structList : null;
    const isSwitchOn = props.isDose;
    const toggleSwitch = props.toggleDose;
    const isLoading = props.loading != null ? props.loading : false;

    const [checked, setChecked] = useState({});

    function initChecks() {
        if (structs == null) return;
        let checkBoxes = {};
        for (let struct of structs) {
            checkBoxes[struct.roi] = false;
        }
        setChecked(checkBoxes);
    }

    function toggleChecked(roi) {
        const newState = { ...checked, [roi]: !checked[roi] };
        setChecked(newState);
        let res = [];
        Object.keys(newState).forEach((key) => {
            if (newState[key]) res.push(Number(key))
        });
        props.handleChecked(res);
    }

    useEffect(initChecks, [structs]);

    return (
        <Paper className={classes.drawerContainer}>
            <List>
                <ListItem><Typography variant="h6">Dose</Typography></ListItem>
                <ListItem>
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch color={'primary'} checked={isSwitchOn} onChange={toggleSwitch}></Switch>}
                            label={"RD File"}
                        />

                    </FormGroup>
                </ListItem>
                <Divider></Divider>
                <ListItem><Typography variant="h6">Structures</Typography></ListItem>
                <ListItem>
                    {structs != null && Object.keys(checked).length !== 0 && !isLoading ? <FormControl component="fieldset">
                        <FormGroup>
                            {
                                structs.map((struct) => (
                                    <FormControlLabel
                                        key={`${struct.name}${struct.roi}`}
                                        control={<Checkbox name={`${struct.roi}`} checked={!!checked[struct.roi]} onChange={() => toggleChecked(struct.roi)} style={{ color: `rgb(${struct.displayColor[0]},${struct.displayColor[1]},${struct.displayColor[2]})` }} />}
                                        label={struct.name}
                                    />
                                ))
                            }

                        </FormGroup>
                    </FormControl> : <div className={classes.loading}>
                            <CircularProgress color='primary'></CircularProgress>
                        </div>}
                </ListItem>
            </List>

        </Paper>
    );
}

export default StructMenu;