import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const Filter = props => {
	const { list, currentItem, onChange, classes } = props;
	
	return (
		<div className={classes.container}>
			<Hidden only='xs'>
				<div className={classes.bar}>
					{list.map((item, index) => (
						<Typography key={index}
						            onClick={() => onChange(item)}
						            variant='subheading'
						            color='primary'
						            className={item === currentItem ? classes.selected : classes.filter}
						>
							{item}
						</Typography>
					))}
				</div>
			</Hidden>
			
			<Hidden smUp>
				<Select value={currentItem}
				        onChange={event => onChange(event.target.value)}
				>
					{list.map((item, index) => (
						<MenuItem value={item} key={index}>{item}</MenuItem>
					))}
				</Select>
			</Hidden>
		</div>
	);
}

const styles = theme => ({
	container: {
		position: 'fixed',
		zIndex: theme.zIndex.appBar + 1,
		width: '100%',
		height: theme.spacing.unit * 5,
		backgroundColor: theme.palette.common.white
	},
	bar: {
		display: 'flex',
		padding: 0,
		width: '100%'
	},
	filter: {
		padding: `10px ${theme.spacing.unit * 4}px`,
		cursor: 'pointer'
	},
	selected: {
		padding: `10px ${theme.spacing.unit * 4}px`,
		marginTop: '-5px',
		borderTop: `5px solid ${theme.palette.secondary.main}`
	}
});

export default withStyles(styles)(Filter);