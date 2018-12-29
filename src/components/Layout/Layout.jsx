import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ classes, children, location }) => (
  <MuiThemeProvider theme={createMuiTheme(theme)}>
    <CssBaseline />
    <Helmet>
      <html lang="en" />
    </Helmet>

    <div className={classes.container}>
      <Header location={location} />
      <div className={classes.content}>
        {children}
      </div>
      <Footer />
    </div>
  </MuiThemeProvider>
);

Layout.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  content: {
    flexGrow: 1,
  },
};

export default withStyles(styles)(Layout);
