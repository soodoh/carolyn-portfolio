import React from 'react';
import background from '../assets/background.jpg';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import profile from '../assets/profile.jpg';
import SocialMedia from '../SocialMedia';

class About extends React.Component {
	componentWillMount() {
		document.body.className = this.props.classes.background;
	}
	
	componentWillUnmount() {
		document.body.className = '';
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<div className={classes.container}>
				<Grid container>
					<Grid item xs={12} sm={5} md={3} className={classes.content}>
						<img src={profile}
						     alt='Headshot'
						     className={classes.profile}
						/>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							Los Angeles / / Bay Area
						</Typography>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							carolyn@diloreto.com
						</Typography>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							408.761.2013
						</Typography>
						
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							<SocialMedia />
						</Typography>
					</Grid>
					
					<Grid item xs={12} sm={7} md={9} className={classes.content}>
						<Typography variant='body1'
						            color='inherit'
						>
							I am a multi-media visual artist and dancer from San Jose, CA. As of May 2018, I am a graduate of the University of Southern California’s School of Cinematic Arts, majoring in Media Arts + Practice with a double minor in Dance and Computer Programming.
						</Typography>
						<Typography variant='body1'
						            color='inherit'
						>
							Since I was little, I've had a passion for performing arts, while simultaneously growing skills in media technologies. Through my studies and work experience, I have gained a rich knowledge of interaction design and storytelling techniques. Retaining an earnest curiosity in finding a way to combine areas of movement, media technologies, and design.
						</Typography>
						<Typography variant='body1'
						            color='inherit'
						>
							My wide-range of skills can be attributed to my insatiable desire to understand the world around us, and how technology can influence how we live. As a photographer, dancer, and visual designer, I have gained a strong visual understanding. I believe visual storytelling is the most effective way to impact others through unique and imaginative perspectives.
						</Typography>
						<Typography variant='body1'
						            color='inherit'
						>
							I aspire to apply my interests in entertainment and technology in my future professional involvements. In all the work I do, I think about the potential impact on our society, retaining a passionate awareness of marginalized communities and the future of our planet. I am always open to new opportunities and projects where I can gain new skills as well as apply my own. If you're interested in collaborating, hiring, or just chatting about life, feel free to contact me at carolyn@diloreto.com!
						</Typography>
					</Grid>
				</Grid>
			</div>
		);
	}
}

const styles = theme => ({
	container: {
		paddingTop: theme.spacing.unit * 2
	},
	content: {
		padding: theme.spacing.unit * 2,
		color: theme.palette.primary.contrastText
	},
	profile: {
		boxSizing: 'border-box',
		border: `${theme.spacing.unit * 2}px solid ${theme.palette.secondary.main}`,
		width: '100%'
	},
	background : {
		backgroundImage: `url("${background}")`,
		backgroundPosition: 'center',
		backgroundSize: 'cover',
		backgroundAttachment: 'fixed'
	}
});

export default withStyles(styles)(About);