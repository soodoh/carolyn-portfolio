import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { JSX } from "react";

export const Route = createFileRoute("/projects")({
	component: ProjectsLayout,
});

function ProjectsLayout(): JSX.Element {
	return <Outlet />;
}
