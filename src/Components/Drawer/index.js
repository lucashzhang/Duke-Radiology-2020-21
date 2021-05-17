import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Paper, FormGroup, FormControlLabel, Checkbox, CircularProgress, FormControl, Divider, List, ListItem, Typography, Switch, Accordion } from '@material-ui/core';
import { handleCheckedStructs } from '../../Redux/actions';


const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: '232px',
        height: '100vh',
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
    },
    tabs: {
        width: '100%'
    }
}));


function StructMenu(props) {

    const classes = useStyles();
    const isSwitchOn = props.isDose;
    const toggleSwitch = props.toggleDose;
    const isLoading = props.loading != null ? props.loading : false;

    const checked = useSelector(state => state.selectionDrawer.structures.selectedStructures, shallowEqual);
    const structs = useSelector(state => state.selectionDrawer.structures.structureList, shallowEqual);
    const dispatch = useDispatch();

    function toggleChecked(roi) {
        const newState = { ...checked, [roi]: !checked[roi] };
        dispatch(handleCheckedStructs(newState));
    }

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
                                        control={
                                            <Checkbox
                                                name={`${struct.roi}`}
                                                checked={!!checked[struct.roi]}
                                                onChange={() => toggleChecked(struct.roi)}
                                                color={'default'}
                                                style={{ 
                                                    color: `rgb(${struct.displayColor[0]},${struct.displayColor[1]},${struct.displayColor[2]})`,
                                                }}
                                            />
                                        }
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