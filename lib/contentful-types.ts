import type { EntryFieldTypes, EntrySkeletonType } from "contentful";

export type ProjectSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    summary: EntryFieldTypes.Text;
    coverImage: EntryFieldTypes.AssetLink;
    projectType: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    order: EntryFieldTypes.Integer;
    role: EntryFieldTypes.Text;
    description: EntryFieldTypes.Text;
    videoLink: EntryFieldTypes.Text;
    password: EntryFieldTypes.Text;
  },
  "project"
>;

export type AboutSkeleton = EntrySkeletonType<
  {
    background: EntryFieldTypes.AssetLink;
    profilePicture: EntryFieldTypes.AssetLink;
    bio: EntryFieldTypes.Text;
    location: EntryFieldTypes.Text;
    email: EntryFieldTypes.Text;
    resume: EntryFieldTypes.AssetLink;
  },
  "about"
>;

export type SocialMediaSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Text;
    link: EntryFieldTypes.Text;
  },
  "socialMedia"
>;

export type PhotosSkeleton = EntrySkeletonType<
  {
    album: EntryFieldTypes.Text;
    photos: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
    order: EntryFieldTypes.Integer;
  },
  "photos"
>;
