import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@prisma/client";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  totalXp: number;
  currentStreak: number;
  country: string;
}

interface AppState {
  user: UserSession;
  soundEnabled: boolean;
  theme: "dark" | "light";
  completedGames: Record<string, { score: number; timeMs: number; isRevived: boolean }>;
  rewardedAdModal: {
    isOpen: boolean;
    gameSlug: string;
    onRewardSuccess: () => void;
  } | null;

  // Actions
  setUser: (user: Partial<UserSession>) => void;
  switchRole: (role: Role) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  recordGameCompletion: (slug: string, score: number, timeMs: number, isRevived?: boolean) => void;
  openRewardedAdModal: (gameSlug: string, onRewardSuccess: () => void) => void;
  closeRewardedAdModal: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: "admin-default-id",
        name: "Joyal Architect (Admin)",
        email: "admin@dailypuzzlehub.com",
        role: Role.ADMIN,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Joyal",
        totalXp: 8500,
        currentStreak: 7,
        country: "NP",
      },
      soundEnabled: true,
      theme: "dark",
      completedGames: {},
      rewardedAdModal: null,

      setUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      switchRole: (role) =>
        set((state) => ({
          user: {
            ...state.user,
            role,
            name: role === Role.ADMIN ? "Joyal Architect (Admin)" : "Daily Puzzle Player",
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${role}`,
          },
        })),

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      recordGameCompletion: (slug, score, timeMs, isRevived = false) => {
        const state = get();
        const updated = {
          ...state.completedGames,
          [slug]: { score, timeMs, isRevived },
        };
        set({
          completedGames: updated,
          user: {
            ...state.user,
            totalXp: state.user.totalXp + score,
          },
        });
      },

      openRewardedAdModal: (gameSlug, onRewardSuccess) =>
        set({
          rewardedAdModal: {
            isOpen: true,
            gameSlug,
            onRewardSuccess,
          },
        }),

      closeRewardedAdModal: () => set({ rewardedAdModal: null }),
    }),
    {
      name: "dailypuzzlehub_state_v2",
      partialize: (state) => ({
        user: state.user,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
        completedGames: state.completedGames,
      }),
    }
  )
);
