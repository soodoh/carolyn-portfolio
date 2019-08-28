import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import ProjectThumbnail from './ProjectThumbnail';
import Masonry from '../common/Masonry';

const Projects = (props) => {
  const { data } = props;

  return (
    <Masonry>
      {data.map((project) => (
        <ProjectThumbnail
          key={uid(project)}
          data={project}
        />
      ))}
    </Masonry>
  );
};

Projects.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

export default Projects;
