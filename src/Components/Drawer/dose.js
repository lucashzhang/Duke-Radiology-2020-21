import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Paper, FormGroup, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { handleCheckedDoses } from '../../Redux/actions';


const useStyles = makeStyles((theme) => ({
    container: {
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1rem',
        width: '100%',
        height: '100%',
    },
    loading: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    form: {
        height: 'calc(100% - 2.5rem)',
        overflow: 'auto',
        marginTop: '0.5rem'
    },
    fileAccordion: {
        background: theme.palette.surfacePrimary.main,
    },
}));


function DoseMenu() {

    const classes = useStyles();

    const checkedDoses = useSelector(state => state.selectionDrawer.selectedDoses, shallowEqual);
    const dispatch = useDispatch();
    const [isExpanded, setExpanded] = useState(false);

    const toggleSwitch = (file) => () => {
        const newState = { ...checkedDoses, [file]: !checkedDoses[file] };
        dispatch(handleCheckedDoses(newState));
    }

    const handleAccordion = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Paper className={classes.container}>
            <Typography variant="h6">Doses</Typography>
            <FormGroup className={classes.form}>
                {
                    Object.entries(checkedDoses).map(dose => (
                        <Accordion className={classes.fileAccordion} onChange={handleAccordion(dose[0])} key={dose[0]} expanded={isExpanded === dose[0]}>
                            <AccordionSummary>
                                <FormControlLabel
                                    control={<Checkbox color={'primary'} checked={!!dose[1]} onChange={toggleSwitch(dose[0])}></Checkbox>}
                                    label={dose[0]}
                                />
                            </AccordionSummary>
                            <AccordionDetails>
                                Options go here
                            </AccordionDetails>
                        </Accordion>

                    ))
                }

            </FormGroup>
        </Paper>
    );
}

export default DoseMenu;