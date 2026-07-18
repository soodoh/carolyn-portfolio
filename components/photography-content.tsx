"use client";

import type { JSX, MouseEvent } from "react";
import { useRef, useState } from "react";
import Filter from "@/components/filter";
import ImageGallery from "@/components/image-gallery";
import ImageWrapper, {
	MASONRY_IMAGE_BREAKPOINTS,
	MASONRY_IMAGE_SIZES,
} from "@/components/image-wrapper";
import Masonry from "@/components/masonry";
import { Button } from "@/components/ui/button";
import { getPhotographyAlbum } from "@/lib/photography-server-functions";
import type { Album } from "@/lib/types";

const PhotographyContent = ({
	albumNames,
	initialAlbum,
}: {
	albumNames: string[];
	initialAlbum: Album;
}): JSX.Element => {
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [album, setAlbum] = useState(initialAlbum);
	const [selectedAlbumName, setSelectedAlbumName] = useState(initialAlbum.name);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [loadError, setLoadError] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const openingButtonRef = useRef<HTMLButtonElement>(null);
	const albumRequestId = useRef(0);
	const requestedAlbumName = useRef<string | undefined>(undefined);

	const handleAlbumChange = (albumName: string) => {
		if (requestedAlbumName.current === albumName) {
			return;
		}
		const requestId = albumRequestId.current + 1;
		albumRequestId.current = requestId;
		requestedAlbumName.current = albumName;
		setSelectedAlbumName(albumName);
		setGalleryOpen(false);
		setLoadError(undefined);
		if (albumName === album.name) {
			requestedAlbumName.current = undefined;
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		void (async () => {
			try {
				const nextAlbum = await getPhotographyAlbum({ data: albumName });
				if (albumRequestId.current === requestId) {
					requestedAlbumName.current = undefined;
					setAlbum(nextAlbum);
				}
			} catch {
				if (albumRequestId.current === requestId) {
					requestedAlbumName.current = undefined;
					setSelectedAlbumName(album.name);
					setLoadError("Unable to load this album. Please try again.");
				}
			} finally {
				if (albumRequestId.current === requestId) {
					setIsLoading(false);
				}
			}
		})();
	};

	const handleThumbnailClick = (
		index: number,
		event: MouseEvent<HTMLButtonElement>,
	) => {
		openingButtonRef.current = event.currentTarget;
		setCurrentPhotoIndex(index);
		setGalleryOpen(true);
	};

	return (
		<>
			<Filter
				options={albumNames}
				current={selectedAlbumName}
				onChange={handleAlbumChange}
			/>

			<ImageGallery
				open={galleryOpen}
				initialIndex={currentPhotoIndex}
				images={album.photos}
				onClose={() => setGalleryOpen(false)}
				returnFocusRef={openingButtonRef}
			/>

			{loadError ? (
				<p role="alert" className="text-center text-dark">
					{loadError}
				</p>
			) : null}
			<div aria-busy={isLoading}>
				{isLoading ? (
					<span role="status" className="sr-only">
						Loading {selectedAlbumName} album
					</span>
				) : null}
				<Masonry>
					{album.photos.map((image, index) => (
						<Button
							key={`image-${image.id}`}
							variant="ghost"
							disabled={isLoading}
							aria-label={`View fullscreen photo (${image.title})`}
							onClick={(event) => handleThumbnailClick(index, event)}
							className="h-auto w-full p-0 rounded-none hover:bg-transparent"
						>
							<ImageWrapper
								alt=""
								breakpoints={MASONRY_IMAGE_BREAKPOINTS}
								quality={50}
								image={image}
								sizes={MASONRY_IMAGE_SIZES}
							/>
						</Button>
					))}
				</Masonry>
			</div>
		</>
	);
};

export default PhotographyContent;
