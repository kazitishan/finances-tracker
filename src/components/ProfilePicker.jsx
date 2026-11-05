"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/ui/PageHeader";
import { PlusIcon } from "@/components/ui/icons";
import { inputClasses } from "@/lib/formUtils";

// Shown at "/" while no one is signed in: every profile in router.json to sign in with, and a form to create one.
function ProfilePicker() {
    const { createProfile, signIn } = useProfile();
    const [profiles, setProfiles] = useState(null);
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        fetch("/api/profiles")
            .then((res) => {
                if (!res.ok) throw new Error(`Couldn't load profiles: ${res.status}`);
                return res.json();
            })
            .then(setProfiles)
            .catch(() => showToast("Couldn't load profiles"));
    }, [showToast]);

    async function handleSignIn(id) {
        setBusy(true);
        try {
            await signIn(id);
        } catch {
            showToast("Couldn't sign in");
            setBusy(false);
        }
    }

    async function handleCreate(event) {
        event.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        try {
            await createProfile(name);
        } catch {
            showToast("Couldn't create profile");
            setBusy(false);
        }
    }

    if (!profiles) return null;

    return (
        <div>
            <PageHeader
                title={profiles.length > 0 ? "Choose a Profile" : "Welcome!"}
                description={profiles.length > 0 ? "Sign in to a profile, or create a new one." : "Create a profile to get started."}
            />

            {profiles.length > 0 && (
                <div className="mb-6 flex flex-col gap-3">
                    {profiles.map((profile) => (
                        <button
                            key={profile.id}
                            type="button"
                            onClick={() => handleSignIn(profile.id)}
                            disabled={busy}
                            className="card flex w-full items-center gap-3 p-4 text-left cursor-pointer disabled:cursor-default"
                        >
                            <div className="logo-tile bg-[var(--accent-soft)] font-semibold text-[var(--accent)]">
                                {(profile.name.trim()[0] || "?").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 truncate font-medium">
                                {profile.name || <span className="text-muted">Unnamed profile</span>}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleCreate} className="card flex flex-col gap-4 p-5">
                <label className="flex flex-col gap-1">
                    <span className="field-label">New Profile</span>
                    <input
                        type="text"
                        autoComplete="name"
                        autoFocus={profiles.length === 0}
                        className={inputClasses}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </label>
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
                        <PlusIcon size={14} />
                        Create Profile
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfilePicker;
