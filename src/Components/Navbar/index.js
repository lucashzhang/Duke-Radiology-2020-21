import React, { useState } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import theme from '../../Utilities/theme';

import { Drawer, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import { FaHome, FaImages } from 'react-icons/fa';
import { Link } from "react-router-dom";
import clsx from 'clsx';
import { useSelector, shallowEqual } from 'react-redux';
import C from '../../Redux/constants';

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
        color: theme.palette.primary.main,
    },
    menu: {
        color: theme.palette.primary.main,
    },
}));


function WebsiteDrawer(props) {

    const classes = useStyles();
    const fileStatus = useSelector(state => state.files.folderStatus, shallowEqual);

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
                            <Tooltip title='Home'><ListItemIcon className={clsx({
                                    [classes.viewing]: props.location.pathname === '/',
                                })}><FaHome /></ListItemIcon></Tooltip>
                            <ListItemText primary='Home' />
                        </ListItem>
                        <ListItem button disabled={fileStatus !== C.FILES.FILE_STATUS_SUCCESS} component={Link} to='/images'>
                            <Tooltip title='Images'><ListItemIcon className={clsx({
                                    [classes.viewing]: props.location.pathname === '/images',
                                })}><FaImages /></ListItemIcon></Tooltip>
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