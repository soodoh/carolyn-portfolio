import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import background from '../assets/background.jpg';
import logo from '../assets/logo.png';

class Home extends React.Component {
	render() {
		const { classes } = this.props;
		
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
						<Button variant='raised' color='secondary' className={classes.button}>
							View Photography
						</Button>
						<Button variant='raised' color='secondary' className={classes.button}>
							View Projects
						</Button>
					</div>
				</section>
				
				<div style={{ height: '300vh' }}>
					Test
				</div>
			</div>
			
		);
	}
}

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
		width: '40vw'
	},
	button: {
		border: `1px solid ${theme.palette.secondary.main}`,
		backgroundColor: 'transparent'
	},
	logo: {
		height: '15rem',
		marginBottom: theme.spacing.unit * 2
	},
	title: {
		fontSize: '5vw'
	}
});

export default withStyles(styles)(Home);