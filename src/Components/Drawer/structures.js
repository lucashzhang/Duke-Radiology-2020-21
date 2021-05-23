import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Paper, FormGroup, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import { handleCheckedStructs } from '../../Redux/actions';


const useStyles = makeStyles((theme) => ({
    container: {
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1rem',
        width: '100%',
        height: '100%'
    },
    loading: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    form: {
        flexDirection: 'row',
        height: 'calc(100% - 2.5rem)',
        overflow: 'auto',
        marginTop: '0.5rem',
        '& label': {
            width: '11rem'
        }
    }
}));


function StructMenu() {

    const classes = useStyles();

    const checkedStructs = useSelector(state => state.selectionDrawer.selectedStructures, shallowEqual);
    const structs = useSelector(state => state.files.rsSummary.structList, shallowEqual);
    const dispatch = useDispatch();
    function toggleChecked(roi) {
        const newState = { ...checkedStructs, [roi]: !checkedStructs[roi] };
        dispatch(handleCheckedStructs(newState));
    }

    return (
        <Paper className={classes.container}>
            <Typography variant="h6">Structures</Typography>
            <FormGroup className={classes.form}>
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
        </Paper >
    );
}

export default StructMenu;