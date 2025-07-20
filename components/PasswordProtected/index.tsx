"use client";

import classNames from "classnames/bind";
import Link from "next/link";
import { type FormEventHandler, useState } from "react";
import styles from "./passwordProtected.module.css";

const cx = classNames.bind(styles);

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
    <div className={styles.password}>
      <Link aria-label="Go back" href="/projects">
        <svg inline-src="left-arrow" />
        Go Back
      </Link>
      <h1>Password Protected</h1>
      <p>Please enter a password to continue.</p>
      <form onSubmit={handleSubmit}>
        <input
          aria-label="Password"
          type="password"
          className={cx({ passwordError: showError })}
          value={passwordInput}
          onChange={(event) => setPasswordInput(event.target.value)}
        />
        {showError && (
          <span className={styles.errorText}>
            The password you entered is incorrect
          </span>
        )}
        <button aria-label="Submit password" type="submit">
          Enter
        </button>
      </form>
    </div>
  );
};

export default PasswordProtected;
