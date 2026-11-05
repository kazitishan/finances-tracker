"use client";

import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { useToast } from "@/components/ToastProvider";
import DeleteProfileModal from "@/components/modals/DeleteProfileModal";
import { TrashIcon } from "@/components/ui/icons";
import PageHeader from "@/components/ui/PageHeader";
import { inputClasses } from "@/lib/formUtils";

export default function ProfilePage() {
  const { profile, saveProfile } = useProfile();
  // What's typed in the field, or null to show the saved name.
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const showToast = useToast();

  const name = draft ?? profile?.name ?? "";

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveProfile({ name });
      setDraft(null);
      showToast("Profile saved");
    } catch {
      showToast("Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" />

      {profile && (
        <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-1">
            <span className="field-label">Name</span>
            <input
              type="text"
              autoComplete="name"
              className={inputClasses}
              value={name}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your name"
            />
            {!name.trim() && <span className="field-hint">A name is required</span>}
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !name.trim() || name.trim() === profile.name}
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {profile && (
        <div className="card mt-6 flex items-center justify-between gap-4 p-5">
          <div>
            <div className="font-medium">Delete Profile</div>
            <div className="text-sm text-muted">Permanently deletes this profile and all of its data.</div>
          </div>
          <button type="button" onClick={() => setDeleting(true)} className="btn btn-danger shrink-0">
            <TrashIcon size={14} />
            Delete Profile
          </button>
        </div>
      )}

      {deleting && <DeleteProfileModal onClose={() => setDeleting(false)} />}
    </div>
  );
}
