import React, { useCallback, useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { useDropzone } from 'react-dropzone';
import { List, ListItem, ListItemText } from '@material-ui/core';

import { readRSFiles } from '../../Utilities/fileHandler.js';



const useStyles = makeStyles((theme) => ({
    drawerContainer: {
        width: 'calc(270px - 2rem)',
        height: 'calc(100vh - 2rem)',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.paper,
        padding: '1rem',
        overflow: 'auto'
    }
}));


function FileDrawer() {

    const classes = useStyles();

    const [isClickable, setIsClickable] = useState(true);
    const [structs, setStructs] = useState([]);

    const onDrop = useCallback(acceptedFiles => {
        readRSFiles(acceptedFiles).then(newStructs => {
            setStructs(newStructs) 
        });
    }, []);
    const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true });


    return (
        <ThemeProvider theme={theme}>
            <div {...getRootProps()} className={classes.drawerContainer} onClick={() => { if (isClickable) open() }}>
                <input {...getInputProps()} />
                {
                    <List onMouseEnter={() => setIsClickable(false)} onMouseLeave={() => setIsClickable(true)}>
                        {
                            structs.map((struct, index) => (
                                <ListItem button key={`${struct.name}${struct.roi}`}>
                                    <ListItemText primary={struct.name} />
                                </ListItem>
                            ))
                        }
                    </List>
                }
            </div>
        </ThemeProvider>
    );
}

export default FileDrawer;