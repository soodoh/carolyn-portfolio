"use client";

import LeftArrowIcon from "@/components/icons/LeftArrowIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type FormEventHandler, useState } from "react";

// This is not actually meant to be secure
// This feature does not warrant the complexity of real auth (at the moment)
const PasswordProtected = ({
  password,
  onAuth,
}: {
  password: string;
  onAuth: () => void;
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (passwordInput !== password) {
      setShowError(true);
    } else {
      onAuth();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex flex-col bg-dark text-light-text w-[calc(100%-3rem)] max-w-[560px] mx-auto p-(--spacing-padding) box-border">
        <Link
          aria-label="Go back"
          href="/projects"
          className="flex items-center text-light text-lg underline self-start [&_svg]:w-8 [&_svg]:mr-4 [&_svg]:fill-light"
        >
          <LeftArrowIcon />
          Go Back
        </Link>
        <h1 className="m-0 mt-12 mb-1 text-[32px] text-center">
          Password Protected
        </h1>
        <p className="text-center text-lg m-0">
          Please enter a password to continue.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-[300px] mx-auto mt-10 mb-8 max-sm:w-full"
        >
          <input
            aria-label="Password"
            type="password"
            className={cn(
              "w-full h-9 rounded-lg text-lg px-4 border-none bg-light-text text-dark shadow-[inset_0px_1px_4px_0px_rgba(0,0,0,0.25)] box-border focus:outline-1 focus:outline-light",
              showError && "outline-1 outline-error",
            )}
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
          />
          {showError && (
            <span className="mt-2 text-xs text-error">
              The password you entered is incorrect.
            </span>
          )}
          <Button
            variant="outline"
            aria-label="Submit password"
            type="submit"
            className="bg-transparent text-light text-lg border-light rounded-none w-[180px] h-[50px] mt-10 hover:bg-light/10 hover:text-light max-sm:w-full"
          >
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtected;
