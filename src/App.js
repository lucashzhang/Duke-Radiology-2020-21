import React from "react";
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import Dashboard from './Components/Dashboard';
import Navbar from './Components/Navbar';

const useStyles = makeStyles((theme) => ({
  windowContainer: {
    marginLeft: '57px'
  }
}));

function App() {

  const classes = useStyles();

  return (
    <Router>
      {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
      <Route><Navbar></Navbar></Route>
      <div className={classes.windowContainer}>
        <Switch>
          <Route exact path="/"><Dashboard></Dashboard></Route>
          <Route render={() => <Redirect to="/" />} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
