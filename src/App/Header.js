import React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from 'mdi-material-ui/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import logo from '../assets/logo.png';
import { withStyles } from '@material-ui/core/styles';

class Header extends React.Component {
	constructor(props) {
		super(props);
		
		const { match } = this.props;
		this.state = {
			isTransparent: match.path === '/' || match.path.match(/about/gi),
			hideBrand: match.path === '/',
			menuAnchor: null
		};
		this.handleScroll = this.handleScroll.bind(this);
	}
	
	componentWillMount() {
		const { match } = this.props;
		
		if(match.path === '/')
			document.addEventListener('scroll', this.handleScroll);
		else
			this.setState({ isTransparent: false, hideBrand: false });
	}
	
	componentWillUnmount() {
		document.removeEventListener('scroll', this.handleScroll)
	}
	
	handleScroll() {
		const breakpoint = window.innerHeight - 60;
		
		if(breakpoint < window.scrollY)
			this.setState({ isTransparent: false, hideBrand: false });
		else
			this.setState({ isTransparent: true, hideBrand: true });
	}
	
	render() {
		const { classes, match } = this.props;
		const NavLinks = [
			{ label: 'About.', path: '/about' },
			{ label: 'Projects.', path: '/projects' },
			{ label: 'Photography.', path: '/photography' },
			{ label: 'Resume.', path: '/resume' }
		];
		
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
							
							<Hidden only='xs'>
								<Typography variant='title'
								            color='inherit'
								            className={classes.name}
								>
									Carolyn DiLoreto
								</Typography>
							</Hidden>
						</div>
					}
					
					<Hidden only='xs'>
						{NavLinks.map((link, index) => (
							<NavLink to={link.path}
							         key={index}
							         className={classes.link}
							         activeClassName={classes.active}
							>
								<Typography variant='subheading' color='inherit'>{link.label}</Typography>
							</NavLink>
						))}
					</Hidden>
					<Hidden smUp>
						<Button variant='fab' mini
						        aria-owns={this.state.menuAnchor ? 'Navigation' : null}
						        aria-haspopup="true"
						        color='secondary'
						        classes={{root: classes.navMenu}}
						        onClick={event => this.setState({ menuAnchor: event.currentTarget })}
						>
							<MenuIcon />
						</Button>
						
						<Menu id='Navigation'
						      anchorEl={this.state.menuAnchor}
						      open={!!this.state.menuAnchor}
						      onClose={() => this.setState({ menuAnchor: null })}
						>
							{NavLinks.map((link, index) => (
								<NavLink to={link.path}
								         key={index}
								         className={classes.menuLink}
								>
									<MenuItem onClick={() => this.setState({ menuAnchor: null })}>
										<Typography variant='subheading' color='inherit'>{link.label}</Typography>
									</MenuItem>
								</NavLink>
							))}
						</Menu>
					</Hidden>
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
		transition: `background-color ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
		boxShadow: 'none'
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
	navMenu: {
		backgroundColor: 'transparent',
		border: `1px solid ${theme.palette.secondary.main}`,
		borderRadius: '2px',
		
		'&:focus': {
			backgroundColor: 'transparent'
		}
	},
	menuLink: {
		color: theme.palette.primary.main,
		textDecoration: 'none',
	}
});

export default withStyles(styles)(Header);