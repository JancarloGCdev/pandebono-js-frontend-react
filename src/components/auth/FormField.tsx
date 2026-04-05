type FormFieldProps = {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  revealToggle?: boolean;
  revealed?: boolean;
  onRevealToggle?: () => void;
};

export function FormField({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  disabled,
  revealToggle,
  revealed,
  onRevealToggle,
}: FormFieldProps) {
  const effectiveType =
    type === "password" && revealToggle && revealed ? "text" : type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={effectiveType}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 outline-none transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:ring-2 focus:ring-offset-0 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/25 dark:border-zinc-700 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
          } ${revealToggle ? "pr-24" : ""}`}
        />
        {revealToggle ? (
          <button
            type="button"
            onClick={onRevealToggle}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {revealed ? "Ocultar" : "Mostrar"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
