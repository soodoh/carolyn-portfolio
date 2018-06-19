import React from 'react';
import background from './assets/background.jpg';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SocialMedia from './SocialMedia';
import ReactMarkdown from 'react-markdown';
import Keys from "./keys";

class About extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		this.state = {};
	}
	
	componentWillMount() {
		document.body.className = this.props.classes.background;
	}
	
	componentWillUnmount() {
		document.body.className = '';
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'about' }).then(res => {
			this.setState({ data: res.items[0] });
		});
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<div className={classes.container}>
				<Grid container>
					<Grid item xs={12} sm={5} md={3} className={classes.content}>
						<img src={this.state.data && this.state.data.fields.profilePicture.fields.file.url}
						     alt='Headshot'
						     className={classes.profile}
						/>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							{this.state.data && this.state.data.fields.location}
						</Typography>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							{this.state.data && this.state.data.fields.email}
						</Typography>
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							{this.state.data && this.state.data.fields.phoneNumber}
						</Typography>
						
						<Typography variant='caption'
						            color='secondary'
						            align='center'
						>
							<SocialMedia />
						</Typography>
					</Grid>
					
					<Grid item xs={12} sm={7} md={9} className={classes.content}>
						<ReactMarkdown>
							{this.state.data && this.state.data.fields.bio}
						</ReactMarkdown>
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
		...theme.typography.body1,
		padding: theme.spacing.unit * 2,
		color: theme.palette.primary.contrastText,
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