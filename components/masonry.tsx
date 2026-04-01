import type { JSX, ReactNode } from "react";
import Masonry from "react-masonry-css";

const MasonryContainer = ({
	children,
}: {
	children: ReactNode;
}): JSX.Element => {
	return (
		<Masonry
			breakpointCols={{
				// Arbitrary breakpoints
				default: 4,
				1260: 3,
				962: 2,
				660: 1,
			}}
			className="masonry-grid"
			columnClassName="masonry-grid-column"
		>
			{children}
		</Masonry>
	);
};

export default MasonryContainer;
