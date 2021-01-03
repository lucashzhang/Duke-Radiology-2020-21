import React, { useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import { FaHome, FaImages } from 'react-icons/fa';
import { Link } from "react-router-dom";
import clsx from 'clsx';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        fontSize: 24
    },
    drawerClose: {
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(7) + 1,
        },
    },
    viewing: {
        color: theme.palette.secondary.main,
    },
    menu: {
        color: theme.palette.primary.main,
    },
}));


function WebsiteDrawer(props) {

    const classes = useStyles();


    return (
        <div>
            <ThemeProvider theme={theme}>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, classes.drawerOpen)}
                    classes={{
                        paper: classes.drawerClose
                    }}
                >
                    <List>
                        <ListItem button component={Link} to='/'>
                            <Tooltip title='Home'><ListItemIcon><FaHome /></ListItemIcon></Tooltip>
                            <ListItemText primary='Home' />
                        </ListItem>
                        <ListItem button component={Link} to='/images'>
                            <Tooltip title='Images'><ListItemIcon><FaImages /></ListItemIcon></Tooltip>
                            <ListItemText primary='Images' />
                        </ListItem>
                        {/* <ListItem button component={Link} to='/about'>
                            <Tooltip title='About Me'><ListItemIcon><FaUser /></ListItemIcon></Tooltip>
                            <ListItemText primary='About Me' />
                        </ListItem>
                        <ListItem button component={Link} to='/programming'>
                            <Tooltip title='My Projects'><ListItemIcon><FaCode /></ListItemIcon></Tooltip>
                            <ListItemText primary='My Projects' />
                        </ListItem>
                        <ListItem button component={Link} to='/contact'>
                            <Tooltip title='Contact Me'><ListItemIcon><FaAddressBook /></ListItemIcon></Tooltip>
                            <ListItemText primary='Contact Me' />
                        </ListItem> */}
                    </List>
                </Drawer>
            </ThemeProvider>
        </div>
    )
}


export default WebsiteDrawer;