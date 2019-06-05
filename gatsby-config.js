// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require('dotenv');

// Load environment variables from project
dotenv.config();
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_DELIVERY_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error(
    'Contentful spaceId and the delivery token need to be provided.',
  );
}

const siteUrl = 'https://carolyndiloreto.com';

module.exports = {
  siteMetadata: {
    siteUrl,
  },
  plugins: [
    'gatsby-plugin-eslint',
    'gatsby-plugin-layout',
    'gatsby-plugin-remove-trailing-slashes',
    'gatsby-transformer-remark',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-remove-serviceworker',
    // 'gatsby-plugin-offline',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-141361857-2',
        head: true,
        anonymize: true,
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: siteUrl,
        sitemap: `${siteUrl}/sitemap.xml`,
        policy: [{ userAgent: '*', allow: '/' }],
      },
    },
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Old Standard TT', 'Karla'],
        },
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Carolyn DiLoreto Portfolio',
        short_name: 'CD Portfolio',
        start_url: '/',
        background_color: '#494F5C',
        theme_color: '#CEC0A8',
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: 'standalone',
        icon: 'src/images/favicon.png', // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-source-contentful',
      options: { spaceId, accessToken },
    },
  ],
};
