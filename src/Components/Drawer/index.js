import React, { useCallback, useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { useDropzone } from 'react-dropzone';
import { List, ListItem, ListItemText } from '@material-ui/core';


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
    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles);
    }, [])
    const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true });
    const [isClickable, setIsClickable] = useState(true)

    return (
        <ThemeProvider theme={theme}>
            <div {...getRootProps()} className={classes.drawerContainer} onClick={() => {if (isClickable) open()}}>
                <input {...getInputProps()} />
                {
                    <List onMouseEnter={() => setIsClickable(false)} onMouseLeave={() => setIsClickable(true)}>
                        <ListItem button onClick={e => e.preventDefault()}>
                            <ListItemText primary='Home' />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary='About Me' />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary='My Projects' />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary='Contact Me' />
                        </ListItem>
                    </List>
                }
            </div>
        </ThemeProvider>
    );
}

export default FileDrawer;