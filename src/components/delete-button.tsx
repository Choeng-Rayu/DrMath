"use client";

import { useFormStatus } from "react-dom";

function DeleteSubmitInner({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="button button-small"
      style={{
        color: "#b42222",
        border: "1px solid #efbbbb",
        background: pending ? "#fee2e2" : "transparent",
        opacity: pending ? 0.75 : 1,
        cursor: pending ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending && (
        <svg
          style={{
            animation: "spin 0.8s linear infinite",
            width: "14px",
            height: "14px",
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
      <span>{pending ? "កំពុងលុប..." : label}</span>
    </button>
  );
}

export function DeleteButton({
  action,
  id,
  label = "លុប",
  confirmMessage = "តើអ្នកប្រាកដថាចង់លុបធាតុនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      style={{ marginTop: ".5rem" }}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteSubmitInner label={label} />
    </form>
  );
}
