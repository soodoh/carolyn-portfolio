import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import SocialMedia from '../common/SocialMedia';

const useStyles = makeStyles((theme) => ({
  footer: {
    flexShrink: 0,
    width: '100%',
    height: 'auto',
    padding: theme.spacing(1, 0),
  },
  credits: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    height: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    color: theme.palette.gray[700],

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <section className={classes.content}>
        <div className={classes.credits}>
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

export default Footer;
