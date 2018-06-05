import React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import logo from '../assets/logo.png';
import { withStyles } from '@material-ui/core/styles';

class Header extends React.Component {
	constructor(props) {
		super(props);
		
		const { match } = this.props;
		this.state = {
			isTransparent: match.path === '/' || match.path.match(/about/gi),
			hideBrand: match.path === '/'
		};
		this.handleScroll = this.handleScroll.bind(this);
	}
	
	componentWillMount() {
		const { match } = this.props;
		
		if(match.path === '/')
			document.addEventListener('scroll', this.handleScroll);
		else if(match.path.match(/about/gi))
			this.setState({ isTransparent: true, hideBrand: false });
		else
			this.setState({ isTransparent: false, hideBrand: false });
	}
	
	componentWillUnmount() {
		document.removeEventListener('scroll', this.handleScroll)
	}
	
	handleScroll() {
		if(window.innerHeight < window.scrollY)
			this.setState({ isTransparent: false, hideBrand: false });
		else
			this.setState({ isTransparent: true, hideBrand: true });
	}
	
	render() {
		const { classes, match } = this.props;
		
		return (
			<AppBar position={match.path === '/' ? 'fixed' : 'sticky'}
			        className={this.state.isTransparent ? classes.transparent : classes.appBar}
			>
				<Toolbar>
					{this.state.hideBrand ? <div className={classes.brand} /> :
						<div className={classes.brand}>
							<NavLink to='/'>
								<img className={classes.logo}
								     src={logo}
								     alt='CD Logo'
								/>
							</NavLink>
							
							<Typography variant='title'
							            color='inherit'
							            className={classes.name}
							>
								Carolyn DiLoreto
							</Typography>
						</div>
					}
					
					<NavLink to='/about'
					         className={classes.link}
					         activeClassName={classes.active}
					>
						<Typography variant='subheading' color='inherit'>About.</Typography>
					</NavLink>
					<NavLink to='/projects'
					         className={classes.link}
					         activeClassName={classes.active}
					>
						<Typography variant='subheading' color='inherit'>Projects.</Typography>
					</NavLink>
					<NavLink to='/photography'
					         className={classes.link}
					         activeClassName={classes.active}
					>
						<Typography variant='subheading' color='inherit'>Photography.</Typography>
					</NavLink>
					<NavLink to='/resume'
					         className={classes.link}
					         activeClassName={classes.active}
					>
						<Typography variant='subheading' color='inherit'>Resume.</Typography>
					</NavLink>
				</Toolbar>
			</AppBar>
		);
	}
}

const styles = theme => ({
	brand: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
		color: theme.palette.primary.contrastText,
		textDecoration: 'none'
	},
	appBar: {
		transition: `background-color ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`
	},
	transparent: {
		transition: `background-color ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
		backgroundColor: 'transparent',
		boxShadow: 'none'
	},
	name: {
		fontSize: '2rem',
		lineHeight: '1rem',
		paddingLeft: theme.spacing.unit * 4
	},
	logo: {
		height: '3rem'
	},
	link: {
		color: theme.palette.primary.contrastText,
		textDecoration: 'none',
		paddingLeft: theme.spacing.unit * 4
	},
	active: {
		color: theme.palette.secondary.main,
		fontWeight: 'bold'
	},
	
});

export default withStyles(styles)(Header);