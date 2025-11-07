import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// Supabase
import type { ProfileWithGroups } from '@/lib/supabase/userData'

interface ProfileWithGroupsState {
    profileWithGroups: ProfileWithGroups | null
    setProfileWithGroups: (user: ProfileWithGroups | null) => void
    clearProfileWithGroups: () => void
}

export const useProfileWithGroupsStore = create<ProfileWithGroupsState>()(
    persist(
        (set) => ({
            profileWithGroups: null,
            setProfileWithGroups: (profileWithGroups) => set({ profileWithGroups }),
            clearProfileWithGroups: () => set({ profileWithGroups: null }),
        }),
        { name: 'profile-with-groups' }
    )
)
