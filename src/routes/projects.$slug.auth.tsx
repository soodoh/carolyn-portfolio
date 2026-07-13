import { createFileRoute } from "@tanstack/react-router";
import type { JSX } from "react";
import PasswordForm from "@/components/password-form";

export const Route = createFileRoute("/projects/$slug/auth")({
	head: () => ({
		meta: [
			{ title: "CD Projects - Password Protected" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: AuthPage,
});

function AuthPage(): JSX.Element {
	const { slug } = Route.useParams();
	return <PasswordForm slug={slug} />;
}
