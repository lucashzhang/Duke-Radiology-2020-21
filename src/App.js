import React from "react";
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import ImageDashboard from './Components/ImageDashboard';
import Navbar from './Components/Navbar';
import Landing from './Components/Landing';

import theme from './Utilities/theme';
import { useDirectory } from './Backend/fileHooks';

const useStyles = makeStyles((theme) => ({
  windowContainer: {
    marginLeft: '57px'
  }
}));

function App() {

  const classes = useStyles();
  const [absDir, setAbsDir] = useDirectory();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Route component={Navbar}></Route>
        <div className={classes.windowContainer}>
          <Switch>
            <Route exact path="/images"><ImageDashboard></ImageDashboard></Route>
            <Route path="/"><Landing></Landing></Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
