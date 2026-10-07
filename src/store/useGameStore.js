import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { newMission, advanceSol } from '../engine/simulate.js';
import { findStorylet, applyStoryletChoice } from '../engine/storylets.js';

// localStorage can throw (private mode, sandboxed iframes). Never let that break the game.
const safeStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export const useGame = create(
  persist(
    (set, get) => ({
      screen: 'title',          // title | setup | play | debrief
      mode: 'astronaut',        // cadet | astronaut | specialist
      game: null,               // engine state
      report: null,             // end-of-sol report being shown
      storylet: null,           // storylet waiting for a decision
      overlay: null,            // 'sources' | 'settings' | 'help' | null
      settings: { readable: false, colorblind: false, reduceMotion: false },

      setMode: (mode) => set({ mode }),
      goSetup: () => set({ screen: 'setup' }),
      goTitle: () => set({ screen: 'title', report: null, storylet: null }),
      setOverlay: (overlay) => set({ overlay }),
      toggleSetting: (k) => set((s) => ({ settings: { ...s.settings, [k]: !s.settings[k] } })),

      launch: (objectiveIds, cargo, spaceWeather) => {
        const game = newMission({ mode: get().mode, objectiveIds, cargo, spaceWeather });
        set({ game, screen: 'play', report: null, storylet: findStorylet(game) });
      },

      setTask: (crewId, task) => set((s) => ({
        game: { ...s.game, crew: s.game.crew.map((c) => (c.id === crewId ? { ...c, task } : c)) },
      })),
      setPlan: (key, value) => set((s) => ({ game: { ...s.game, plan: { ...s.game.plan, [key]: value } } })),

      endSol: () => {
        const { state, report } = advanceSol(get().game);
        set({ game: state, report });
      },

      closeReport: () => {
        const g = get().game;
        if (g.outcome) return set({ report: null, screen: 'debrief' });
        set({ report: null, storylet: findStorylet(g) });
      },

      choose: (choiceIndex) => {
        const { game, storylet } = get();
        set({ game: applyStoryletChoice(game, storylet.id, choiceIndex), storylet: null });
      },

      abandon: () => set({ game: null, screen: 'title', report: null, storylet: null }),
    }),
    {
      name: 'artemis-base-commander-v2',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ screen: s.screen, mode: s.mode, game: s.game, report: s.report, storylet: s.storylet, settings: s.settings }),
    }
  )
);
