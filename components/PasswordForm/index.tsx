"use client";

import {
  type AuthState,
  verifyProjectPassword,
} from "@/app/projects/[slug]/auth/actions";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useActionState } from "react";

const PasswordForm = ({ slug }: { slug: string }) => {
  const boundAction = verifyProjectPassword.bind(null, slug);
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    boundAction,
    { error: null },
  );

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto flex w-[calc(100%-3rem)] max-w-[560px] flex-col bg-dark p-(--spacing-padding) text-light-text">
        <Link
          aria-label="Go back"
          href="/projects"
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
          action={formAction}
          className="mx-auto mt-10 mb-8 flex w-[300px] flex-col items-center max-sm:w-full"
        >
          <input
            aria-label="Password"
            name="password"
            type="password"
            className={cn(
              "h-9 w-full rounded-lg border-none bg-light-text px-4 text-lg text-dark shadow-[inset_0px_1px_4px_0px_rgba(0,0,0,0.25)] focus:outline-1 focus:outline-light",
              state.error && "outline-1 outline-error",
            )}
          />
          {state.error && (
            <span className="mt-2 text-xs text-error">{state.error}</span>
          )}
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
