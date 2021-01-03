import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, FormControl, InputLabel, OutlinedInput, IconButton, List, ListItem, Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { FaFolderOpen } from 'react-icons/fa';
import { pickDirectoryPath, scanFiles } from '../../Backend/fileHandler';
import { useDirectory } from "../../Backend/fileHooks";

const useStyles = makeStyles((theme) => ({
    page: {
        background: theme.palette.primary.main,
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 3fr 3fr 1fr',
        gridTemplateRows: '2rem 1fr 1fr 1fr 1fr 2rem'
    },
    title: {
        gridColumn: '2',
        gridRow: '2',
        margin: '2rem',
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    directory: {
        gridColumn: '2',
        gridRow: '3 / 6',
        margin: '2rem',
        padding: '1rem'
    },
    doctor: {
        gridColumn: '3',
        gridRow: '2 / 4',
        margin: '2rem'
    },
    patient: {
        gridColumn: '3',
        gridRow: '4 / 6',
        margin: '2rem'
    },
    fileSummary: {
        height: 'calc(100% - 4rem)',
        overflow: 'auto'
    }
}))

function Landing() {
    const classes = useStyles();
    const [absDir, setAbsDir] = useDirectory();
    const [fileScan, setFileScan] = useState({});

    async function handleDirectoryClick() {
        const newPathObj = await pickDirectoryPath(absDir);
        if (newPathObj.canceled || newPathObj.filePaths[0] == null) return;
        const newPath = newPathObj.filePaths[0];
        const scanResult = await scanFiles(newPath);
        setAbsDir(newPath);
        setFileScan(scanResult);
    }

    function handleDirectoryInput(e) {
        setAbsDir(e.target.value)
    }

    return (
        <div className={classes.page}>
            <Typography className={classes.title} variant={'h2'}>Placeholder</Typography>
            <Paper className={classes.directory}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="directory-input">Choose Your Directory</InputLabel>
                    <OutlinedInput id="directory-input" label="Choose Your Directory"
                        endAdornment={<IconButton onClick={handleDirectoryClick}><FaFolderOpen></FaFolderOpen></IconButton>}
                        value={absDir}
                        onChange={handleDirectoryInput}
                    ></OutlinedInput>
                </FormControl>
                <div className={classes.fileSummary}>
                    <Accordion>
                        <AccordionSummary>
                            CT Files
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {Object.keys(fileScan).length > 0 && fileScan.seriesInfo && fileScan.seriesInfo.ctInfo ? fileScan.seriesInfo.ctInfo.map(ct => (
                                    <ListItem key={ct.filename}>{ct.filename}</ListItem>
                                )) : null}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>
                            RS File
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {Object.keys(fileScan).length > 0 && fileScan.rsInfo ? (
                                    <ListItem>{fileScan.rsInfo.filename}</ListItem>
                                ) : null}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </Paper>
            <Paper className={classes.doctor}>

            </Paper>
            <Paper className={classes.patient}>

            </Paper>
        </div>
    )
}

export default Landing;