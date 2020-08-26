import React, { ReactElement } from 'react';
import ProjectThumbnail from './ProjectThumbnail';
import Masonry from '../common/Masonry';
import { Project } from '../../types';

interface ProjectsProps {
  data: Project[];
}

const Projects = (props: ProjectsProps): ReactElement => {
  const { data } = props;

  return (
    <Masonry>
      {data.map(project => ({
        id: project.id,
        element: <ProjectThumbnail key={project.id} data={project} />,
      }))}
    </Masonry>
  );
};

export default Projects;
