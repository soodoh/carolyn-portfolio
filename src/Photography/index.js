import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';

class Photography extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient({
		});
		
		this.state = {
			albums: [],
			currentAlbum: ''
		};
		this.displayPhotos = this.displayPhotos.bind(this);
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'photos' }).then(res => {
			this.setState({
				albums: res.items,
				currentAlbum: res.items[0].fields.album
			});
			
			// res.items[0].fields.photos.forEach(photo => {
			// 	console.log(photo);
			// });
		});
	}
	
	displayPhotos() {
		let currentAlbum = this.state.albums.find(album => {
			return album && album.fields && album.fields.album === this.state.currentAlbum
		});
		
		console.log(currentAlbum)
	}
	
	render() {
		console.log(this.state.albums);
		
		return (
			<div>
				<Filter list={this.state.albums.map(album => album.fields.album)}
				        currentItem={this.state.currentAlbum}
				        onChange={value => this.setState({ currentAlbum: value })}
				/>
				
				{this.displayPhotos()}
			</div>
		);
	}
}

const styles = {

};

export default withStyles(styles)(Photography);