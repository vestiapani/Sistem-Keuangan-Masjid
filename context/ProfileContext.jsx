"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    namaMasjid: "Masjid At-Taqwa",
    namaBendahara: "",
    avatarUrl: "",
    initials: "AD",
    loading: true,
  });

  const computeInitials = (nama) => {
    if (!nama) return "AD";
    return nama
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const loadProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile((prev) => ({ ...prev, loading: false }));
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("nama_bendahara, nama_masjid, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        let avatarUrl = "";
        if (data.avatar_url) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.avatar_url);
          avatarUrl = urlData?.publicUrl ?? "";
        }

        setProfile({
          namaMasjid: data.nama_masjid || "Masjid At-Taqwa",
          namaBendahara: data.nama_bendahara || "",
          avatarUrl,
          initials: computeInitials(data.nama_bendahara),
          loading: false,
        });
      } else {
        setProfile((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error("ProfileContext error:", err);
      setProfile((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Update profil dari luar (setelah save di halaman profil/pengaturan)
  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      initials: updates.namaBendahara
        ? computeInitials(updates.namaBendahara)
        : prev.initials,
    }));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, reloadProfile: loadProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfile harus dipakai di dalam ProfileProvider");
  return ctx;
}
