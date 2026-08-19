"use client";

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
      <button className="button button-small" style={{ color: "#b42222", border: "1px solid #efbbbb" }} type="submit">
        {label}
      </button>
    </form>
  );
}
