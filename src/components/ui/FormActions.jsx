// The buttons under an add/edit form: Delete when editing an existing item, then Add or Save Changes.
// `hint` explains why saving is disabled.
function FormActions({ isEditing, onSave, onDelete, submitting, disabled = false, hint }) {
    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
                {isEditing && onDelete && (
                    <button type="button" onClick={onDelete} disabled={submitting} className="btn btn-danger py-2.5">
                        Delete
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onSave()}
                    disabled={submitting || disabled}
                    className="btn btn-primary flex-1 py-2.5"
                >
                    {isEditing ? "Save Changes" : "Add"}
                </button>
            </div>
            {hint && <span className="field-hint">{hint}</span>}
        </div>
    );
}

export default FormActions;
