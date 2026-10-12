function DetailSection({ title, children }) {
    return (
        <div className="mt-4 first:mt-0">
            <div className="field-label mb-1.5">{title}</div>
            {children}
        </div>
    );
}

export function NotesSection({ notes }) {
    if (!notes) return null;

    return (
        <DetailSection title="Notes">
            <div className="text-sm whitespace-pre-wrap">{notes}</div>
        </DetailSection>
    );
}

export default DetailSection;
