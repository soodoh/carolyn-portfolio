import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import Masonry from 'react-masonry-component';
import ProjectThumbnail from './ProjectThumbnail';

const Projects = (props) => {
  const { data } = props;

  return (
    <div>
      <Masonry>
        {data.map(project => (
          <ProjectThumbnail
            key={uid(project)}
            data={project}
          />
        ))}
      </Masonry>
    </div>
  );
};

Projects.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
};

export default Projects;
