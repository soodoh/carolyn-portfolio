import React, { ReactElement } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Metadata from '../components/common/Metadata';
import { padding } from '../components/Layout/theme';

const useStyles = makeStyles({
  container: {
    padding,
  },
});
const NotFound = (): ReactElement => {
  const classes = useStyles();

  return (
    <>
      <Metadata title="CD: Page Not Found" robots="noindex, nofollow" />

      <div className={classes.container}>
        <Typography variant="h3" gutterBottom>
          404: Page Not Found
        </Typography>
        <Typography variant="h6">Please check your URL, or select something from the nav bar</Typography>
      </div>
    </>
  );
};

export default NotFound;
