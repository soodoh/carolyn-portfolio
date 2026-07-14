import { Link, useRouter } from "@tanstack/react-router";
import type { FormEvent, JSX } from "react";
import { useState, useTransition } from "react";
import LeftArrowIcon from "@/components/icons/left-arrow-icon";
import { Button } from "@/components/ui/button";
import { isProjectPasswordWithinLimit } from "@/lib/server-function-inputs";
import { cn } from "@/lib/utils";
import { verifyProjectPassword } from "@/lib/verify-project-password";

const PASSWORD_ERROR_ID = "project-password-error";

const PasswordForm = ({ slug }: { slug: string }): JSX.Element => {
	const router = useRouter();
	const [error, setError] = useState<string>();
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const password = formData.get("password");
		const passwordValue = typeof password === "string" ? password : "";
		if (!isProjectPasswordWithinLimit(passwordValue)) {
			setError("Password is too long.");
			return;
		}
		startTransition(async () => {
			const result = await verifyProjectPassword({
				data: { slug, password: passwordValue },
			});
			if (result.error) {
				setError(result.error);
				return;
			}
			setError(undefined);
			await router.invalidate();
		});
	};

	return (
		<div className="flex flex-1 flex-col justify-center">
			<div className="mx-auto flex w-[calc(100%-3rem)] max-w-[560px] flex-col bg-dark p-(--spacing-padding) text-light-text">
				<Link
					aria-label="Go back"
					to="/projects"
					className="flex items-center self-start text-lg text-light underline [&_svg]:mr-4 [&_svg]:w-8 [&_svg]:fill-light"
				>
					<LeftArrowIcon />
					Go Back
				</Link>
				<h1 className="m-0 mt-12 mb-1 text-center text-[32px]">
					Password Protected
				</h1>
				<p className="m-0 text-center text-lg">
					Please enter a password to continue.
				</p>
				<form
					onSubmit={handleSubmit}
					className="mx-auto mt-10 mb-8 flex w-[300px] flex-col items-center max-sm:w-full"
				>
					<input
						aria-label="Password"
						aria-describedby={error ? PASSWORD_ERROR_ID : undefined}
						aria-invalid={Boolean(error)}
						name="password"
						type="password"
						className={cn(
							"h-9 w-full rounded-lg border-none bg-light-text px-4 text-lg text-dark shadow-[inset_0px_1px_4px_0px_rgba(0,0,0,0.25)] focus:outline-1 focus:outline-light",
							error && "outline-1 outline-error",
						)}
					/>
					{error ? (
						<span
							id={PASSWORD_ERROR_ID}
							role="alert"
							className="mt-2 text-xs text-error"
						>
							{error}
						</span>
					) : null}
					<Button
						variant="outline"
						aria-label="Submit password"
						type="submit"
						disabled={isPending}
						className="mt-10 h-[50px] w-[180px] rounded-none border-light bg-transparent text-lg text-light hover:bg-light/10 hover:text-light max-sm:w-full"
					>
						{isPending ? "Verifying..." : "Enter"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default PasswordForm;
