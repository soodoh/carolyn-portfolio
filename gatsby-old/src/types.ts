import { GatsbyImageFluidProps, FluidObject } from 'gatsby-image';

export interface Markdown {
  childMarkdownRemark: {
    html: string;
  };
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  thumbnail: FluidObject;
  fullSize: FluidObject;
}

export interface PhotoAlbum {
  id: string;
  album: string;
  photos: Photo[];
}

export interface Project {
  id: string;
  title: string;
  role: string;
  password?: string;
  projectType: string[];
  link: string;
  description: Markdown;
  summary: { summary: string };
  coverImage: GatsbyImageFluidProps;
}
