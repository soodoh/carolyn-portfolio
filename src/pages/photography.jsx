import React from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Metadata from '../components/Layout/Metadata';
import Filters from '../components/common/Filters';
import Gallery from '../components/Photos/Gallery';

class PhotographyCore extends React.Component {
  constructor(props) {
    super(props);

    const currentAlbum = props.albums[0].album;
    this.state = {
      currentAlbum,
      photos: this.getPhotos(currentAlbum),
    };
    this.getPhotos = this.getPhotos.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
  }

  getPhotos(matchAlbum) {
    const { albums } = this.props;
    const currentAlbum = albums.find(album => (
      album.album === matchAlbum
    ));
    const { photos } = currentAlbum;

    return photos;
  }

  changeFilter(value) {
    this.setState({
      currentAlbum: value,
      photos: this.getPhotos(value),
    });
  }

  render() {
    const { classes, albums } = this.props;
    const { currentAlbum, photos } = this.state;

    return (
      <React.Fragment>
        <Metadata
          title="CD Photography"
          description="Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA."
        />

        <div className={classes.container}>
          <Filters
            list={albums.map(album => album.album)}
            currentItem={currentAlbum}
            onChange={this.changeFilter}
          />

          <Gallery photos={photos} />
        </div>
      </React.Fragment>
    );
  }
}

PhotographyCore.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  albums: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

const styles = theme => ({
  container: {
    position: 'relative',
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

const PhotographyWithStyles = withStyles(styles)(PhotographyCore);

export default () => (
  <StaticQuery
    query={graphql`
      query PhotographyQuery {
        allContentfulPhotoAlbum(sort: {fields: [order], order: ASC}) {
          edges {
            node{
              album
              photos {
                title
                description
                thumbnail: fluid(maxWidth: 600) {
                  ...GatsbyContentfulFluid_withWebp
                }
                fullSize: fluid(maxWidth: 1920) {
                  srcWebp
                  srcSetWebp
                }
              }
            }
          }
        }
      }
    `}
    render={data => (
      <PhotographyWithStyles
        albums={data.allContentfulPhotoAlbum.edges.map(item => (
          item.node
        ))}
      />
    )}
  />
);
