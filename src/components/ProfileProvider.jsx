"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import NamePromptModal from "@/components/modals/NamePromptModal";
import { useToast } from "@/components/ToastProvider";

const ProfileContext = createContext({ profile: null, saveProfile: async () => {} });

// `profile` is null until it loads. `saveProfile(profile)` saves it and returns the saved profile, or throws.
export function useProfile() {
    return useContext(ProfileContext);
}

// Loads the profile once for every page. While it has no name, a popup that can't be dismissed asks for one.
function ProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const showToast = useToast();

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error(`Couldn't load profile: ${res.status}`);
                return res.json();
            })
            .then(setProfile)
            .catch(() => showToast("Couldn't load your profile"));
    }, [showToast]);

    const saveProfile = useCallback(async (updates) => {
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(`Couldn't save profile: ${res.status}`);
        const saved = await res.json();
        setProfile(saved);
        return saved;
    }, []);

    const value = useMemo(() => ({ profile, saveProfile }), [profile, saveProfile]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
            {profile && !profile.name && <NamePromptModal onSave={saveProfile} />}
        </ProfileContext.Provider>
    );
}

export default ProfileProvider;
