import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import SocialMedia from '../SocialMedia';

const Footer = props => {
	const { classes } = props;
	
	return (
		<footer className={classes.footer}>
			<section className={classes.content}>
				<div>
					<Typography variant='caption' color='inherit'>
						Copyright &copy; {new Date().getFullYear()} Carolyn DiLoreto
					</Typography>
					<Typography variant='caption' color='inherit'>
						Designed by Carolyn DiLoreto
					</Typography>
					<Typography variant='caption' color='inherit'>
						Developed by Paul DiLoreto
					</Typography>
				</div>
				
				<SocialMedia />
			</section>
		</footer>
	);
};

const styles = theme => ({
	footer: {
		width: '100%',
		height: theme.spacing.unit * 11,
		position: 'absolute',
		bottom: 0
	},
	content: {
		display: 'flex',
		flexWrap: 'wrap',
		height: '100%',
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: `0 ${theme.spacing.unit * 2}px`,
		color: theme.palette.gray[700]
	}
});

export default withStyles(styles)(Footer);