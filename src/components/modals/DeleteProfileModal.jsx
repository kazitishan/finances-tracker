"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useProfile } from "@/components/ProfileProvider";
import { useToast } from "@/components/ToastProvider";
import { DownloadIcon } from "@/components/ui/icons";
import { inputClasses } from "@/lib/formUtils";

// The last two of the three confirmations for deleting the signed-in profile (the first is the Profile page's
// Delete Profile button): a warning that offers a download of the profile's info, then typing the profile's name.
// On success the provider signs out, so the app goes to the profile picker.
function DeleteProfileModal({ onClose }) {
    const { profile, deleteProfile } = useProfile();
    const [step, setStep] = useState("warning");
    const [typedName, setTypedName] = useState("");
    const [deleting, setDeleting] = useState(false);
    const showToast = useToast();

    const nameMatches = typedName.trim() === profile.name;

    async function handleDelete(event) {
        event.preventDefault();
        if (!nameMatches) return;
        setDeleting(true);
        try {
            await deleteProfile(typedName);
            showToast("Profile deleted");
        } catch {
            showToast("Couldn't delete profile");
            setDeleting(false);
        }
    }

    return (
        <Modal title="Delete Profile" onClose={deleting ? undefined : onClose}>
            {step === "warning" ? (
                <div className="flex flex-col gap-4">
                    <p className="text-sm">
                        Are you sure you&apos;d like to delete this profile? All of its data will be lost.
                    </p>
                    <a
                        href="/api/download"
                        download="info.json"
                        onClick={() => showToast("Downloading info.json…")}
                        className="btn btn-secondary"
                    >
                        <DownloadIcon size={14} />
                        Press here to download the data
                    </a>
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-2.5">
                            Cancel
                        </button>
                        <button type="button" onClick={() => setStep("name")} className="btn btn-danger flex-1 py-2.5">
                            Continue
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleDelete} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">
                            Type <span className="font-semibold">{profile.name}</span> to confirm that you&apos;d like to delete this profile.
                        </span>
                        <input
                            type="text"
                            autoComplete="off"
                            autoFocus
                            className={inputClasses}
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder={profile.name}
                        />
                    </label>
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={onClose} disabled={deleting} className="btn btn-secondary flex-1 py-2.5">
                            Cancel
                        </button>
                        <button type="submit" disabled={deleting || !nameMatches} className="btn btn-danger flex-1 py-2.5">
                            Delete Profile
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default DeleteProfileModal;
