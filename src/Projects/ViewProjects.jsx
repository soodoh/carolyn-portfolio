import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import Masonry from 'react-masonry-component';
import ProjectModal from './ProjectModal';

const Projects = (props) => {
  const { data } = props;

  return (
    <div>
      <Masonry>
        {data.map(project => (
          <ProjectModal data={project} key={uid(project)} />
        ))}
      </Masonry>
    </div>
  );
};

Projects.propTypes = {
  data: PropTypes.shape({
    fields: PropTypes.object.isRequired,
  }).isRequired,
};

export default Projects;
