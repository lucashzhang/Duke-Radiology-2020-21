import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, FormControl, InputLabel, OutlinedInput, IconButton, List, ListItem, Accordion, AccordionDetails, AccordionSummary, Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@material-ui/core';
import { FaFolderOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { pickDirectoryPath, getSummary } from '../../Backend/fileHandler';
import { useDirectory } from "../../Backend/fileHooks";
import { useSelector, shallowEqual } from "react-redux";
import C from '../../Redux/constants';

const useStyles = makeStyles((theme) => ({
    page: {
        background: theme.palette.surfacePrimary.main,
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '230px 1fr 1fr 230px',
        gridTemplateRows: '2rem 1fr 1fr 1fr 1fr 2rem'
    },
    title: {
        gridColumn: '2',
        gridRow: '2',
        margin: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: theme.palette.surfacePrimary.contrastText
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
        margin: '2rem',
        padding: '1rem'
    },
    patient: {
        gridColumn: '3',
        gridRow: '4 / 6',
        margin: '2rem',
        padding: '1rem'
    },
    files: {
        height: 'calc(100% - 4rem)',
        width: '100%',
        overflow: 'auto',
        paddingTop: '1rem'
    },
    fileAccordion: {
        background: theme.palette.surfacePrimary.main,
        color: 'white'
    },
    fileSummary: {
        display: 'flex'
    },
    fileStatus: {
        margin: 'auto',
        marginRight: '0'
    },
    fileDetails: {
        background: 'white',
        color: theme.palette.text.primary,
        maxHeight: 'calc(75vh - 24rem)',
        overflow: 'auto'
    },
    fileList: {
        width: '100%'
    }
}));

function StatusIcon(props) {
    const isValid = props.isValid;
    const classes = useStyles();

    if (isValid === true) {
        return <FaCheckCircle className={classes.fileStatus} style={{ color: '#4caf50' }}></FaCheckCircle>
    } else if (isValid === false) {
        return <FaTimesCircle className={classes.fileStatus} style={{ color: '#f44336' }}></FaTimesCircle>
    } else {
        return null;
    }

}

function SummaryDialog(props) {
    const { open, onClose, dir, filename } = props;
    const [summary, setSummary] = useState([]);

    useEffect(() => {
        getSummary(dir, filename).then(res => {
            setSummary(res);
        })
    }, [filename])


    return <Dialog open={open} onClose={onClose} maxWidth={'xl'} scroll={'paper'}>
        <DialogTitle>{filename}</DialogTitle>
        <DialogContent>
            {summary.map((tag, i) => {
                return <pre key={i}>{tag}</pre>
            })}
        </DialogContent>
        <DialogActions><Button variant={"contained"} color={"primary"} onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
}

function Landing() {
    const classes = useStyles();
    const [absDir, setAbsDir] = useDirectory();
    const [open, setOpen] = useState(false);
    const [dialogFile, setDialogFile] = useState('')
    const { folderStatus, ctSummary, rsSummary } = useSelector(state => state.files, shallowEqual);

    async function handleDirectoryClick(e) {
        e.target.blur()
        const newPathObj = await pickDirectoryPath(absDir);
        if (newPathObj.canceled || newPathObj.filePaths[0] == null) {
            return;
        };
        const newPath = newPathObj.filePaths[0];
        // checkFiles(newPath);
        setAbsDir(newPath);
    }

    function handleDialogOpen(filename) {
        setDialogFile(filename ? filename : '');
        setOpen(true);
    }

    function handleDialogClose() {
        setOpen(false);
        setDialogFile('');
    }

    function handleFileClick(filename) {
        handleDialogOpen(filename);
    }

    // useEffect(() => checkFiles(absDir), [absDir])

    return (
        <div className={classes.page}>
            <div className={classes.title}>
                <Typography variant={'h1'}>Get Started</Typography>
                <Typography variant={'h5'}>Input your information here</Typography>
            </div>
            <Paper className={classes.directory}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="directory-input">Choose Your Directory</InputLabel>
                    <OutlinedInput id="directory-input" label="Choose Your Directory"
                        endAdornment={<IconButton><FaFolderOpen></FaFolderOpen></IconButton>}
                        value={absDir}
                        error={folderStatus === C.FILES.FILE_STATUS_FAILURE}
                        onClick={handleDirectoryClick}
                    ></OutlinedInput>
                </FormControl>
                <div className={classes.files}>
                    <Accordion className={classes.fileAccordion}>
                        <AccordionSummary>
                            <Typography>RS File</Typography>
                            <StatusIcon isValid={!!rsSummary.isValid}></StatusIcon>
                        </AccordionSummary>
                        <AccordionDetails className={classes.fileDetails}>
                            <List className={classes.fileList}>
                                {rsSummary.filename ? (
                                    <ListItem key={rsSummary.filename} button onClick={() => handleFileClick(rsSummary.filename)}>{rsSummary.filename}</ListItem>
                                ) : <ListItem>No RS Files Selected</ListItem>}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion className={classes.fileAccordion}>
                        <AccordionSummary className={classes.fileSummary}>
                            <Typography>CT Files</Typography>
                            <StatusIcon isValid={!!ctSummary.isValid}></StatusIcon>
                        </AccordionSummary>
                        <AccordionDetails className={classes.fileDetails}>
                            <List className={classes.fileList}>
                                {ctSummary.ctInfo ? ctSummary.ctInfo.map(ct => (
                                    <ListItem key={ct.filename} button onClick={() => handleFileClick(ct.filename)}>{ct.filename}</ListItem>
                                )) : <ListItem>No CT Files Selected</ListItem>}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </Paper>
            <Paper className={classes.doctor}>
                <div><b>Doctor Info Input Placeholder</b></div>
            </Paper>
            <Paper className={classes.patient}>
                <div><b>Patient Info Input Placeholder</b> { }</div>
            </Paper>
            <SummaryDialog open={open} onClose={handleDialogClose} dir={absDir} filename={dialogFile}></SummaryDialog>
        </div>
    )
}

export default Landing;