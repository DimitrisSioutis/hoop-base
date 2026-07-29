import styles from "./new-match-content.module.scss";

export function StatNumberInput({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const increment = () => {
    const n = typeof value === "string" ? Number.parseInt(value) || 0 : value;
    onChange(String(n + 1));
  };
  const decrement = () => {
    const n = typeof value === "string" ? Number.parseInt(value) || 0 : value;
    if (n > 0) onChange(String(n - 1));
  };

  return (
    <div className={styles.statInput}>
      <label className={styles.statInputLabel}>{label}</label>
      <div className={styles.statInputWrapper}>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.statInputField}
          required={required}
          placeholder={placeholder}
        />
        <div className={styles.statInputButtons}>
          <button
            type="button"
            className={styles.statInputButton}
            onClick={increment}
            tabIndex={-1}
            aria-label="Increase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
          <button
            type="button"
            className={styles.statInputButton}
            onClick={decrement}
            tabIndex={-1}
            aria-label="Decrease"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
