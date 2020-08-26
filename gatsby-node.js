const path = require('path');
const slugify = require('slugify');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const projectData = await graphql(`
    {
      allContentfulProject {
        edges {
          node {
            id
            title
            role
            password
            projectType
            link
            description {
              childMarkdownRemark {
                html
              }
            }
            summary {
              summary
            }
            coverImage {
              fluid(maxWidth: 1920) {
                base64
                aspectRatio
                src
                srcSet
                srcWebp
                srcSetWebp
                sizes
              }
            }
          }
        }
      }
    }
  `);
  if (projectData.errors) throw projectData.errors;

  projectData.data.allContentfulProject.edges.forEach(edge => {
    const slug = slugify(edge.node.title, {
      replacement: '-',
      remove: /[^\w\s]/g,
      lower: true,
    });

    createPage({
      path: `projects/${slug}`,
      component: path.resolve('src/templates/project.jsx'),
      context: edge.node,
    });
  });
};
