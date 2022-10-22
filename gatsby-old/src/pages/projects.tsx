import React, { ReactElement } from 'react';
import Projects from '../components/Projects/Projects';
import Metadata from '../components/common/Metadata';

const ProjectsPage = (): ReactElement => (
  <>
    <Metadata
      title="CD Projects"
      description="View Carolyn DiLoreto's past and current projects. From film editing to UX Engineering there are many skills showcased in this section of the portfolio."
    />
    <Projects />
  </>
);

export default ProjectsPage;
