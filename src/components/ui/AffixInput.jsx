import { inputClasses } from "@/lib/formUtils";

const affixClasses = "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted";

// A .field input with its unit inside it, like "$" before an amount or "%" after a rate. Other props go to the input.
function AffixInput({ prefix, suffix, className = "w-full", ...inputProps }) {
    return (
        <div className={`relative ${className}`}>
            {prefix && <span className={`${affixClasses} left-3`}>{prefix}</span>}
            <input
                type="text"
                className={`${inputClasses}${prefix ? " pl-6" : ""}${suffix ? " pr-8" : ""}`}
                {...inputProps}
            />
            {suffix && <span className={`${affixClasses} right-3`}>{suffix}</span>}
        </div>
    );
}

export default AffixInput;
