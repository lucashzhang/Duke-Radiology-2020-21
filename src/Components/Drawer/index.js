import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Paper, FormGroup, FormControlLabel, Checkbox, CircularProgress, FormControl, Divider, List, ListItem, Typography } from '@material-ui/core';
import { handleCheckedStructs, handleCheckedDoses } from '../../Redux/actions';


const useStyles = makeStyles((theme) => ({
    container: {
        width: '232px',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        textOverflow: "ellipsis"
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
}));


function StructMenu(props) {

    const classes = useStyles();
    const isLoading = props.loading != null ? props.loading : false;

    const checkedStructs = useSelector(state => state.selectionDrawer.selectedStructures, shallowEqual);
    const structs = useSelector(state => state.files.rsSummary.structList, shallowEqual);
    const checkedDoses = useSelector(state => state.selectionDrawer.selectedDoses, shallowEqual);
    const dispatch = useDispatch();
    function toggleChecked(roi) {
        const newState = { ...checkedStructs, [roi]: !checkedStructs[roi] };
        dispatch(handleCheckedStructs(newState));
    }
    function toggleSwitch(file) {
        props.toggleDose();
        const newState = { ...checkedDoses, [file]: !checkedDoses[file] };
        dispatch(handleCheckedDoses(newState));
    }

    return (
        <Paper className={classes.drawerContainer}>
            <List>
                <ListItem><Typography variant="h6">Doses</Typography></ListItem>
                <ListItem>
                    <FormGroup>
                        {
                            Object.entries(checkedDoses).map(dose => (
                                <FormControlLabel
                                    control={<Checkbox color={'primary'} checked={!!dose[1]} onChange={() => toggleSwitch(dose[0])}></Checkbox>}
                                    label={dose[0]}
                                />
                            ))
                        }

                    </FormGroup>
                </ListItem>
                <Divider></Divider>
                <ListItem><Typography variant="h6">Structures</Typography></ListItem>
                <ListItem>
                    {structs != null && Object.keys(checkedStructs).length !== 0 && !isLoading ? <FormControl component="fieldset">
                        <FormGroup>
                            {
                                structs.map((struct) => (
                                    <FormControlLabel
                                        key={`${struct.name}${struct.roi}`}
                                        control={
                                            <Checkbox
                                                name={`${struct.roi}`}
                                                checked={!!checkedStructs[struct.roi]}
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