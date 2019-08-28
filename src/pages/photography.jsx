import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import Metadata from '../components/common/Metadata';
import Filters from '../components/common/Filters';
import Gallery from '../components/Photos/Gallery';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    padding: theme.spacing(0, 2),
  },
}));


const getPhotos = (albums, matchAlbum) => {
  const currentAlbum = albums.find((album) => (
    album.album === matchAlbum
  ));
  const { photos } = currentAlbum;

  return photos;
};

const Photography = (props) => {
  const classes = useStyles();
  const { albums } = props;
  const [currentAlbum, setAlbum] = useState(albums[0].album);

  return (
    <>
      <Metadata
        title="CD Photography"
        description="Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA."
      />

      <div className={classes.container}>
        <Filters
          list={albums.map((album) => album.album)}
          currentItem={currentAlbum}
          onChange={(value) => setAlbum(value)}
        />

        <Gallery photos={getPhotos(albums, currentAlbum)} />
      </div>
    </>
  );
};

Photography.propTypes = {
  albums: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

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
                  ...GatsbyContentfulFluid_withWebp
                }
              }
            }
          }
        }
      }
    `}
    render={(data) => (
      <Photography
        albums={data.allContentfulPhotoAlbum.edges.map((item) => (
          item.node
        ))}
      />
    )}
  />
);
