import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const Filter = props => {
	const { list, currentItem, onChange, classes } = props;
	
	return (
		<div className={classes.bar}>
			{list.map((item, index) => (
				<Typography key={index}
				            onClick={() => onChange(item)}
				            variant='subheading'
				            color='primary'
				            className={item === currentItem ?
					            `${classes.selected} ${classes.filter}` : classes.filter}
				>
					{item}
				</Typography>
			))}
		</div>
	);
}

const styles = theme => ({
	bar: {
		display: 'flex',
		padding: `0 ${theme.spacing.unit * 2}px`,
		marginTop: '-5px',
	},
	filter: {
		boxSizing: 'border-box',
		padding: `10px ${theme.spacing.unit * 4}px`,
		cursor: 'pointer',
		zIndex: theme.zIndex.appBar + 1
	},
	selected: {
		paddingTop: '5px',
		borderTop: `5px solid ${theme.palette.secondary.main}`
	}
});

export default withStyles(styles)(Filter);