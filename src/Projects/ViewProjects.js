import React from 'react';
import Masonry from 'react-masonry-component';
import ProjectModal from './ProjectModal';

const Projects = props => {
	const { data } = props;
	console.log(data);
	
	return (
		<div>
			<Masonry>
				{data.map((project, index) => (
					<ProjectModal data={project} key={index} />
				))}
			</Masonry>
		</div>
	);
};

export default Projects;