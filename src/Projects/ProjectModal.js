import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide'
import Zoom from '@material-ui/core/Zoom';
import detectIt from 'detect-it';

function Transition(props) {
	return <Slide direction='down' {...props} />;
}

class ModalBase extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			projectActive: false,
			labelActive: window.innerWidth < 600 || false
		};
		this.toggleProject = this.toggleProject.bind(this);
		this.toggleLabel = this.toggleLabel.bind(this);
	}
	
	componentWillMount() {
	
	}
	
	toggleProject() {
		this.setState({ projectActive: !this.state.projectActive });
	}
	
	toggleLabel() {
		this.setState({ labelActive: !this.state.labelActive });
	}
	
	render() {
		const { classes, data } = this.props;
		
		return (
			<div className={classes.projectContainer}>
				<div className={classes.photoContainer}
				     onClick={this.toggleProject}
				     onMouseEnter={() => this.setState({ labelActive: true })}
				     onMouseLeave={() => this.setState({ labelActive: false })}
				>
					<img src={`${data.fields.coverImage.fields.file.url}?w=400`}
					     alt={data.fields.coverImage.fields.title}
					     className={classes.photo}
					/>
					<Zoom in={detectIt.deviceType === 'touchOnly' || this.state.labelActive}>
						<GridListTileBar title={data.fields.title}
						                 subtitle={data.fields.summary}
						                 className={classes.label}
						/>
					</Zoom>
				</div>
				
				<Dialog open={this.state.projectActive}
				        onClose={this.toggleProject}
				        fullWidth
				        TransitionComponent={Transition}
				>
					<DialogContent>
						<div className={classes.title}>
							<Typography variant='display1' color='primary' align='center'>
								{data.fields.title}
							</Typography>
							<Typography variant='title' color='primary' align='center' gutterBottom>
								{data.fields.role}
							</Typography>
						</div>
						
						{data.fields.link ?
							<div className={classes.videoContainer}>
								<iframe src={data.fields.link}
								        title={data.fields.title}
								        className={classes.video}
								        frameBorder={0}
								        allowFullScreen
								/>
							</div> : null
						}
						
						<ReactMarkdown source={data.fields.description}
						               className={classes.markdown}
						/>
					</DialogContent>
				</Dialog>
			</div>
		);
	}
}

const styles = theme => ({
	title: {
		marginBottom: theme.spacing.unit * 3
	},
	photoContainer: {
		position: 'relative',
		margin: theme.spacing.unit * 2,
		cursor: 'pointer',
		overflow: 'hidden'
	},
	photo: {
		width: `100%`,
		height: 'auto',
		verticalAlign: 'top' // Removes bottom gutter for Masonry
	},
	markdown: {
		fontFamily: theme.typography.fontFamily,
		color: theme.palette.primary.main,
		'& img': {
			width: '100%'
		}
	},
	link: {
		width: '100%',
		height: 'auto'
	},
	videoContainer: {
		padding: '52.73% 0 0 0',
		position: 'relative'
	},
	video: {
		position: 'absolute',
		top: 0, left: 0,
		width: '100%', height: '100%'
	},
	// Breakpoints
	[`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
		projectContainer: {
			width: '50%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.md}px)`]: {
		projectContainer: {
			width: '33.33%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.lg}px)`]: {
		projectContainer: {
			width: '25%'
		}
	}
});

export default withStyles(styles)(ModalBase);