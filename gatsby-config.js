// TODO probably move dotenv to devdependency as this only is run on build
const dotenv = require('dotenv');
const theme = require('./src/components/Layout/theme');

// Load environment variables from project
dotenv.config();
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_DELIVERY_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error(
    'Contentful spaceId and the delivery token need to be provided.',
  );
}

module.exports = {
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
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Old Standard TT', 'Karla'],
        },
      },
    },
    {
      resolve: '@wapps/gatsby-plugin-material-ui',
      options: { theme },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Sarabeth Belon Portfolio',
        short_name: 'SB Portfolio',
        start_url: '/',
        background_color: '#1A1A1A',
        theme_color: '#C66470',
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
