import React, { ReactElement, useState } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { makeStyles } from '@material-ui/styles';
import Metadata from '../components/common/Metadata';
import Filters from '../components/common/Filters';
import Gallery from '../components/Photos/Gallery';
import { PhotoAlbum } from '../types';
import { padding } from '../components/Layout/theme';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    marginTop: `-${padding}`,
  },
});

const getPhotos = (albums: PhotoAlbum[], matchAlbum: string) => {
  const currentAlbum = albums.find(album => album.album === matchAlbum);
  const { photos } = currentAlbum;
  return photos;
};

interface PhotographyProps {
  albums: PhotoAlbum[];
}

const Photography = (props: PhotographyProps): ReactElement => {
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
        <Filters list={albums.map(album => album.album)} currentItem={currentAlbum} onChange={value => setAlbum(value)} />

        <Gallery photos={getPhotos(albums, currentAlbum)} />
      </div>
    </>
  );
};

const PhotographyWithData = (): ReactElement => (
  <StaticQuery
    query={graphql`
      query PhotographyQuery {
        allContentfulPhotoAlbum(sort: { fields: [order], order: ASC }) {
          edges {
            node {
              id
              album
              photos {
                id
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
    render={data => <Photography albums={data.allContentfulPhotoAlbum.edges.map((item: { node: PhotoAlbum }) => item.node)} />}
  />
);
export default PhotographyWithData;
