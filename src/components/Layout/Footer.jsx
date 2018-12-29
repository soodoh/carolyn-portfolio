import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import SocialMedia from '../common/SocialMedia';

const FooterCore = (props) => {
  const { classes } = props;

  return (
    <footer className={classes.footer}>
      <section className={classes.content}>
        <div>
          <Typography variant="caption" color="inherit">
            Copyright &copy;
            {` ${new Date().getFullYear()} `}
            Carolyn DiLoreto
          </Typography>
          <Typography variant="caption" color="inherit">
            Designed by Carolyn DiLoreto
          </Typography>
          <Typography variant="caption" color="inherit">
            Developed by Paul DiLoreto
          </Typography>
        </div>

        <SocialMedia />
      </section>
    </footer>
  );
};

FooterCore.propTypes = {
  classes: PropTypes.shape({
    footer: PropTypes.string,
    content: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  footer: {
    flexShrink: 0,
    width: '100%',
    height: 'auto',
    padding: `${theme.spacing.unit}px 0`,
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    height: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `0 ${theme.spacing.unit * 2}px`,
    color: theme.palette.gray[700],

    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
});

export default withStyles(styles)(FooterCore);
