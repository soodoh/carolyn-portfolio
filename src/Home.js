import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import background from './assets/background.jpg';
import logo from './assets/logo.svg';
import Projects from './Projects';

const Home = props => {
	const { classes } = props;
	
	return (
		<div>
			<section className={classes.home}>
				<img src={logo}
				     alt='CD Logo'
				     className={classes.logo}
				/>
				<Typography variant='title'
				            color='inherit'
				            className={classes.title}
				            gutterBottom
				>
					Carolyn DiLoreto
				</Typography>
				
				<div className={classes.buttonGroup}>
					<Link to='/photography' className={classes.link}>
						<Button variant='outlined'
						        color='secondary'
						        className={classes.button}
						        aria-label='Photography'
						>
							View Photography
						</Button>
					</Link>
					
					<Link to='/projects' className={classes.link}>
						<Button variant='outlined'
						        color='secondary'
						        className={classes.button}
						        aria-label='Projects'
						>
							View Projects
						</Button>
					</Link>
				</div>
			</section>
			
			<section>
				<Projects />
			</section>
		</div>
		
	);
};

const styles = theme => ({
	home: {
		height: '100vh',
		width: '100%',
		backgroundImage: `url("${background}")`,
		backgroundPosition: 'center',
		backgroundSize: 'cover',
		color: theme.palette.primary.contrastText,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	buttonGroup: {
		display: 'flex',
		justifyContent: 'space-between',
		width: '28rem'
	},
	button: {
		border: `1px solid ${theme.palette.secondary.main}`,
		
		'&:hover': {
			transition: theme.transitions.easing,
			color: theme.palette.common.black,
			backgroundColor: theme.palette.secondary.main
		}
	},
	link: {
		textDecoration: 'none'
	},
	logo: {
		height: '15rem',
		marginBottom: theme.spacing.unit * 2
	},
	title: {
		fontSize: '3.5rem'
	},
	[`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
		title: {
			fontSize: '2rem'
		},
		buttonGroup: {
			width: '85vw'
		}
	}
});

export default withStyles(styles)(Home);