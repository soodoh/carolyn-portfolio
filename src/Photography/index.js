import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
import Gallery from './Gallery';
import Keys from '../keys';

class Photography extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		
		this.state = {
			albums: [],
			currentAlbum: '',
			photos: []
		};
		this.setPhotos = this.setPhotos.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'photos' }).then(res => {
			const albums = res.items;
			const currentAlbum = res.items[0].fields.album;
			const photos = this.setPhotos(currentAlbum);
			this.setState({ albums, currentAlbum, photos });
			this.setPhotos(currentAlbum);
		});
	}
	
	changeFilter(value) {
		this.setState({ currentAlbum: value, photos: false });
		this.setPhotos(value);
	}
	
	setPhotos(matchAlbum) {
		let currentAlbum = this.state.albums.find(album => {
			return album && album.fields && album.fields.album === matchAlbum
		});
		let photos = currentAlbum && currentAlbum.fields && currentAlbum.fields.photos;
		
		if(Array.isArray(photos)) {
			photos = photos.map(photo => ({
				title: photo.fields.title,
				url: photo.fields.file.url
			}));
			
			this.setState({ photos });
		}
	}
	
	render() {
		const { classes } = this.props;
		
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