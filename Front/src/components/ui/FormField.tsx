import type { InputHTMLAttributes, ReactNode } from "react";
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  end?: ReactNode;
  error?: string;
};
export function FormField({
  label,
  icon,
  end,
  error,
  className,
  ...props
}: Props) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`input-shell ${error ? "has-error" : ""}`}>
        {icon}
        <input {...props} />
        {end}
      </span>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
