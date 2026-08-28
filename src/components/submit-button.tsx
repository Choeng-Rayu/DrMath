"use client";

import { useFormStatus } from "react-dom";
import React from "react";

type SubmitButtonProps = {
  label?: string;
  loadingLabel?: string;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "normal" | "small";
  children?: React.ReactNode;
};

export function SubmitButton({
  label = "រក្សាទុក",
  loadingLabel = "កំពុងរក្សាទុក...",
  className,
  disabled = false,
  style,
  variant = "primary",
  size = "normal",
  children,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  let btnClasses = className;
  if (!btnClasses) {
    const base = "button";
    const variantClass =
      variant === "primary"
        ? "button-primary"
        : variant === "secondary"
        ? "button-secondary"
        : variant === "danger"
        ? "button-outline"
        : "button-outline";
    const sizeClass = size === "small" ? "button-small" : "";
    btnClasses = `${base} ${variantClass} ${sizeClass}`.trim();
  }

  const dangerStyle: React.CSSProperties =
    variant === "danger"
      ? { color: "#b42222", borderColor: "#efbbbb", background: "transparent" }
      : {};

  return (
    <button
      type="submit"
      className={btnClasses}
      disabled={disabled || pending}
      style={{
        ...dangerStyle,
        ...style,
        opacity: disabled || pending ? 0.75 : 1,
        cursor: disabled || pending ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        transition: "all 0.18s ease",
      }}
      aria-busy={pending}
    >
      {pending && (
        <svg
          style={{
            animation: "spin 0.8s linear infinite",
            width: size === "small" ? "14px" : "18px",
            height: size === "small" ? "14px" : "18px",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      <span>{pending ? loadingLabel : children || label}</span>
    </button>
  );
}
