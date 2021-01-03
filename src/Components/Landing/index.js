import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, FormControl, InputLabel, OutlinedInput, IconButton, List, ListItem, Accordion, AccordionDetails, AccordionSummary, CircularProgress } from '@material-ui/core';
import { FaFolderOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { pickDirectoryPath, scanFiles } from '../../Backend/fileHandler';
import { useDirectory } from "../../Backend/fileHooks";
import { useSelector, shallowEqual } from "react-redux";
import { useDispatch } from "react-redux";
import C from '../../Redux/constants';
import { setFolderStatus } from '../../Redux/actions';

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
        display: 'flex',
        alignItems: 'center',
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
    files: {
        height: 'calc(100% - 4rem)',
        width: '100%',
        overflow: 'auto',
        paddingTop: '1rem'
    },
    fileAccordion: {
        background: theme.palette.primary.main,
        color: 'white'
    },
    fileSummary: {
        display: 'flex'
    },
    fileStatus: {
        margin: 'auto',
        marginRight: '0'
    },
    fileList: {
        background: 'white',
        color: theme.palette.text.primary,
        maxHeight: 'calc(75vh - 24rem)',
        overflow: 'auto'
    }
}));

function StatusIcon() {

    
}

function Landing() {
    const classes = useStyles();
    const [absDir, setAbsDir] = useDirectory();
    const [fileScan, setFileScan] = useState({});
    const fileStatus = useSelector(state => state.files.folderStatus, shallowEqual);
    const dispatch = useDispatch();

    async function handleDirectoryClick() {
        const newPathObj = await pickDirectoryPath(absDir);
        if (newPathObj.canceled || newPathObj.filePaths[0] == null) return;
        const newPath = newPathObj.filePaths[0];
        checkFiles(newPath);
        setAbsDir(newPath);
    }

    async function checkFiles(directory) {
        const scanResult = await scanFiles(directory);
        dispatch(setFolderStatus(scanResult.isValid))
        setFileScan(scanResult);
    }

    return (
        <div className={classes.page}>
            <Typography className={classes.title} variant={'h1'}>Placeholder</Typography>
            <Paper className={classes.directory}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="directory-input">Choose Your Directory</InputLabel>
                    <OutlinedInput id="directory-input" label="Choose Your Directory"
                        endAdornment={<IconButton><FaFolderOpen></FaFolderOpen></IconButton>}
                        value={absDir}
                        error={fileStatus === C.FILES.FILE_STATUS_FAILURE}
                        onClick={handleDirectoryClick}
                    ></OutlinedInput>
                </FormControl>
                <div className={classes.files}>
                    <Accordion className={classes.fileAccordion}>
                        <AccordionSummary>
                            <Typography>RS File</Typography>
                            <FaTimesCircle className={classes.fileStatus}></FaTimesCircle>
                        </AccordionSummary>
                        <AccordionDetails className={classes.fileList}>
                            <List>
                                {Object.keys(fileScan).length > 0 && fileScan.rsInfo ? (
                                    <ListItem key={fileScan.rsInfo.filename} button>{fileScan.rsInfo.filename}</ListItem>
                                ) : <ListItem>No RS Files Selected</ListItem>}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion className={classes.fileAccordion}>
                        <AccordionSummary className={classes.fileSummary}>
                            <Typography>CT Files</Typography>
                            <FaTimesCircle className={classes.fileStatus}></FaTimesCircle>
                        </AccordionSummary>
                        <AccordionDetails className={classes.fileList}>
                            <List>
                                {Object.keys(fileScan).length > 0 && fileScan.seriesInfo && fileScan.seriesInfo.ctInfo ? fileScan.seriesInfo.ctInfo.map(ct => (
                                    <ListItem key={ct.filename} button>{ct.filename}</ListItem>
                                )) : <ListItem>No CT Files Selected</ListItem>}
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