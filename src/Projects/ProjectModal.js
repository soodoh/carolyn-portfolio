import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide'

function Transition(props) {
	return <Slide direction='down' {...props} />;
}

class ModalBase extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = { projectActive: false };
		this.toggle = this.toggle.bind(this);
	}
	
	toggle() {
		this.setState({ projectActive: !this.state.projectActive });
	}
	
	render() {
		const { classes, data } = this.props;
		
		return (
			<div className={classes.projectContainer}>
				<img src={`${data.fields.coverImage.fields.file.url}?w=400`}
				     alt={data.fields.coverImage.fields.title}
				     className={classes.photo}
				     onClick={this.toggle}
				/>
				
				<Dialog open={this.state.projectActive}
				        onClose={this.toggle}
				        fullWidth
				        TransitionComponent={Transition}
				>
					<DialogContent>
						<Typography variant='display1' color='primary' align='center'>
							{data.fields.title}
						</Typography>
						<Typography variant='title' color='primary' align='center'>
							{data.fields.role}
						</Typography>
						
						{data.fields.link ?
							<iframe src={data.fields.link}
							        title={data.fields.title}
							        width='100%'
							        height='auto'
							 />
							: null
						}
						
						<ReactMarkdown source={data.fields.description} className={classes.markdown} />
					</DialogContent>
				</Dialog>
			</div>
		);
	}
}

const styles = theme => ({
	photo: {
		padding: theme.spacing.unit * 2,
		width: `calc(100% - ${theme.spacing.unit * 4}px)`,
		cursor: 'pointer',
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