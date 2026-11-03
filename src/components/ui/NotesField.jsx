import { inputClasses } from "@/lib/formUtils";

// The Notes box at the bottom of a form. NotesSection shows what's typed here on the item's card.
function NotesField({ value, onChange }) {
    return (
        <label className="form-section">
            <span className="field-label">Notes</span>
            <textarea rows={4} className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
    );
}

export default NotesField;
