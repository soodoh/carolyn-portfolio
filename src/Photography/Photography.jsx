import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Filter from '../Filter';
import Gallery from './Gallery';
import Loading from '../Loading';
import Keys from '../env';

function formatPhotos(photos) {
  let formattedPhotos = [];

  if (Array.isArray(photos)) {
    formattedPhotos = photos.map(photo => ({
      title: photo.fields.title,
      url: photo.fields.file.url,
    }));
  }
  return formattedPhotos;
}

class Photography extends React.Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line
    const Contentful = require('contentful');
    this.client = Contentful.createClient(Keys);

    this.state = {
      albums: [],
      currentAlbum: '',
      photos: [],
      loading: true,
    };
    this.getPhotos = this.getPhotos.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
  }

  componentDidMount() {
    this.client.getEntries({ content_type: 'photos' }).then((res) => {
      const albums = res.items.sort((a, b) => (
        a.fields.album.localeCompare(b.fields.album)
      ));
      const currentAlbum = albums[0].fields.album;

      this.setState({
        albums,
        currentAlbum,
        photos: formatPhotos(albums[0].fields.photos),
        loading: false,
      });
    });
  }


  getPhotos(matchAlbum) {
    const { albums } = this.state;
    const currentAlbum = albums.find(album => (
      album && album.fields && album.fields.album === matchAlbum
    ));
    const photos = currentAlbum && currentAlbum.fields.photos;

    return this.formatPhotos(photos);
  }

  changeFilter(value) {
    this.setState({
      currentAlbum: value,
      photos: this.getPhotos(value),
    });
  }

  render() {
    const { classes } = this.props;
    const {
      loading, albums, currentAlbum, photos,
    } = this.state;

    if (loading) { return <Loading />; }

    return (
      <div className={classes.container}>
        <Filter
          list={albums.map(album => album.fields.album)}
          currentItem={currentAlbum}
          onChange={this.changeFilter}
        />

        <Gallery photos={photos} />
      </div>
    );
  }
}

Photography.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
};

const styles = theme => ({
  container: {
    position: 'relative',
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

export default withStyles(styles)(Photography);
