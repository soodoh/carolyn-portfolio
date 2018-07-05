import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Masonry from 'react-masonry-component';
import Lightbox from 'react-images';

class Gallery extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			photoActive: false,
			currentPhoto: 0
		};
	}
	
	render() {
		const { classes, photos, ...other } = this.props;

		return (
			<Masonry {...other}>
				<Lightbox
					images={photos.map(photo => ({ src: photo.url }))}
					isOpen={this.state.photoActive}
					backdropClosesModal
					currentImage={this.state.currentPhoto}
					onClickPrev={() => this.setState({ currentPhoto: this.state.currentPhoto - 1 })}
					onClickNext={() => this.setState({ currentPhoto: this.state.currentPhoto + 1 })}
					onClose={() => this.setState({ photoActive: false })}
				/>
				
				{Array.isArray(photos) && photos.map((photo, index) => (
					<div className={classes.photoContainer} key={index}>
						<img src={`${photo.url}?w=400`}
						     alt={photo.title}
						     className={classes.photo}
						     onClick={() => this.setState({ photoActive: true, currentPhoto: index })}
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