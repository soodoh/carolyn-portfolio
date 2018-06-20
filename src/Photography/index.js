import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
import Gallery from './Gallery';
import Loading from '../Loading';
import Keys from '../keys';

class Photography extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		
		this.state = {
			albums: [],
			currentAlbum: '',
			photos: [],
			loading: true
		};
		this.getPhotos = this.getPhotos.bind(this);
		this.formatPhotos = this.formatPhotos.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'photos' }).then(res => {
			const albums = res.items;
			const currentAlbum = res.items[0].fields.album;
			
			this.setState({
				albums,
				currentAlbum,
				photos: this.formatPhotos(albums[0].fields.photos),
				loading: false
			});
		});
	}
	
	changeFilter(value) {
		this.setState({
			currentAlbum: value,
			photos: this.getPhotos(value)
		});
	}
	
	formatPhotos(photos) {
		if(Array.isArray(photos)) {
			photos = photos.map(photo => ({
				title: photo.fields.title,
				url: photo.fields.file.url,
				isPortrait: photo.fields.file.details.image.width < photo.fields.file.details.image.height
			}));
			
			return photos;
		}
		return [];
	}
	
	getPhotos(matchAlbum) {
		let currentAlbum = this.state.albums.find(album => {
			return album && album.fields && album.fields.album === matchAlbum
		});
		let photos = currentAlbum && currentAlbum.fields.photos;
		
		return this.formatPhotos(photos);
	}
	
	render() {
		const { classes } = this.props;
		
		if(this.state.loading)
			return <Loading />;
			
		return (
			<div className={classes.container}>
				<Filter list={this.state.albums.map(album => album.fields.album)}
				        currentItem={this.state.currentAlbum}
				        onChange={this.changeFilter}
				/>
				
				<Gallery photos={this.state.photos}	/>
			</div>
		);
	}
}

const styles = theme => ({
	container: {
		position: 'relative',
		padding: `0 ${theme.spacing.unit * 2}px`
	}
});

export default withStyles(styles)(Photography);