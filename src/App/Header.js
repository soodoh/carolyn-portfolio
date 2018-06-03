import React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const Links = props => (
	<div className={props.classes.linkGroup}>
		<NavLink to='/about'
		         className={props.classes.link}
		         activeClassName={props.classes.active}
		>
			<Typography variant='subheading' color='inherit'>About.</Typography>
		</NavLink>
		<NavLink to='/projects'
		         className={props.classes.link}
		         activeClassName={props.classes.active}
		>
			<Typography variant='subheading' color='inherit'>Projects.</Typography>
		</NavLink>
		<NavLink to='/photography'
		         className={props.classes.link}
		         activeClassName={props.classes.active}
		>
			<Typography variant='subheading' color='inherit'>Photography.</Typography>
		</NavLink>
		<NavLink to='/resume'
		         className={props.classes.link}
		         activeClassName={props.classes.active}
		>
			<Typography variant='subheading' color='inherit'>Resume.</Typography>
		</NavLink>
	</div>
);

const Header = props => (
	<AppBar position='sticky'>
		<Toolbar>
			<div className={props.classes.brand}>
				<NavLink to='/' className={props.classes.link}>
					<Typography variant='title' color='inherit' className={props.classes.brand}>Carolyn DiLoreto</Typography>
				</NavLink>
			</div>
			
			<Links classes={props.classes} />
		</Toolbar>
	</AppBar>
);

const styles = theme => ({
	brand: {
		flex: 1,
		fontSize: '2rem',
		lineHeight: '1rem',
		color: theme.palette.primary.contrastText,
		textDecoration: 'none'
	},
	linkGroup: {
		display: 'flex',
	},
	link: {
		color: theme.palette.primary.contrastText,
		textDecoration: 'none',
		paddingLeft: theme.spacing.unit * 4
	},
	active: {
		color: theme.palette.secondary.main,
		fontWeight: 'bold'
	}
});

export default withStyles(styles)(Header);