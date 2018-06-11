import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Masonry from 'react-masonry-component';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Loading from '../Loading';

const Transition = props => (
	<Slide direction='up' {...props} />
);

class Gallery extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			photoActive: false,
			currentPhoto: ''
		};
	}
	
	render() {
		const { classes, photos } = this.props;
		
		return (
			<Masonry>
				<Dialog open={this.state.photoActive}
				        onClose={() => this.setState({ photoActive: false })}
				        maxWidth='md'
				        TransitionComponent={Transition}
				>
					{this.state.currentPhoto ?
						<img src={`${this.state.currentPhoto.url}?fm=jpg&fl=progressive`}
						     alt={this.state.currentPhoto.title}
						     className={this.state.currentPhoto.width > this.state.currentPhoto.height ? classes.landscape: classes.portrait}
						/>
						: <Loading />}
				</Dialog>
				
				{Array.isArray(photos) && photos.map((photo, index) => (
					<div className={classes.photoContainer} key={index}>
						<img src={`${photo.url}?w=400`}
						     alt={photo.title}
						     className={classes.photo}
						     onClick={() => this.setState({ photoActive: true, currentPhoto: photo })}
						/>
					</div>
				))}
			</Masonry>
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
	photoContainer: {
		height: 'auto',
		padding: 0,
		margin: 0
	},
	portrait: {
		height: '90vh',
		width: 'auto'
	},
	landscape: {
		width: '100%',
		height: 'auto'
	},
	// Breakpoints
	[`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
		photoContainer: {
			width: '50%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.md}px)`]: {
		photoContainer: {
			width: '33.33%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.lg}px)`]: {
		photoContainer: {
			width: '25%'
		}
	}
});

export default withStyles(styles)(Gallery);