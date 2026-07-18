import { createServerFn } from "@tanstack/react-start";
import { getAlbum } from "@/lib/fetch-photos";
import { validateAlbumName } from "@/lib/server-function-inputs";

export const getPhotographyAlbum = createServerFn({ method: "POST" })
	.validator(validateAlbumName)
	.handler(({ data: albumName }) => getAlbum(albumName));
