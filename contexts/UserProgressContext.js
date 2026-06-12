/**
 * UserProgressContext.js
 *
 * The "Brain" of the AI Tutor.
 * Tracks learning state per Surah and persists it to AsyncStorage.
 *
 * STATE SHAPE:
 * {
 *   activeSurahId: string | null,
 *   lastActiveVerse: number,           // 0-based
 *   surahProgress: {
 *     [surahId]: {
 *       completedVerses: number[],     // verse indices completed
 *       repetitions: { [idx]: number },// play count per verse
 *       verseTimes: { [idx]: number }, // elapsed seconds per verse
 *       lastAccessDate: string,        // ISO string
 *     }
 *   },
 *   streaks: { current, best, lastLoginDate }
 * }
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "user_learning_progress_v2";

const INITIAL_STATE = {
    activeSurahId: null,
    lastActiveVerse: 0,
    surahProgress: {},
    streaks: { current: 0, best: 0, lastLoginDate: null },
};

const UserProgressContext = createContext(null);

export const UserProgressProvider = ({ children }) => {
    const [state, setState] = useState(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    // Track when the current verse was entered (for elapsed time)
    const verseStartTimeRef = useRef(null);

    // ─── Load on mount ───────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) setState(JSON.parse(saved));
            } catch (err) {
                console.error("[UserProgress] Load failed:", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // ─── Save on state change ────────────────────────────────────
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((err) =>
                console.error("[UserProgress] Save failed:", err)
            );
        }
    }, [state, isLoading]);

    // ─── Actions ────────────────────────────────────────────────

    /** Initialize a Surah entry in state if not present */
    const initSurah = useCallback((surahId) => {
        setState((prev) => {
            if (prev.surahProgress[surahId]) return prev;
            return {
                ...prev,
                surahProgress: {
                    ...prev.surahProgress,
                    [surahId]: {
                        completedVerses: [],
                        repetitions: {},
                        verseTimes: {},
                        lastAccessDate: new Date().toISOString(),
                    },
                },
            };
        });
    }, []);

    /** Set active verse + record start timestamp for timing */
    const setActiveVerse = useCallback((surahId, verseIndex) => {
        verseStartTimeRef.current = Date.now();
        setState((prev) => ({
            ...prev,
            activeSurahId: surahId,
            lastActiveVerse: verseIndex,
            surahProgress: {
                ...prev.surahProgress,
                [surahId]: {
                    ...(prev.surahProgress[surahId] || {}),
                    lastAccessDate: new Date().toISOString(),
                },
            },
        }));
    }, []);

    /** Mark a verse as completed + record elapsed time */
    const markVerseCompleted = useCallback((surahId, verseIndex) => {
        const elapsedSeconds = verseStartTimeRef.current
            ? Math.round((Date.now() - verseStartTimeRef.current) / 1000)
            : null;

        setState((prev) => {
            const cur = prev.surahProgress[surahId] || {};
            const completed = new Set(cur.completedVerses || []);
            completed.add(verseIndex);

            const verseTimes = { ...(cur.verseTimes || {}) };
            if (elapsedSeconds !== null) verseTimes[verseIndex] = elapsedSeconds;

            return {
                ...prev,
                surahProgress: {
                    ...prev.surahProgress,
                    [surahId]: {
                        ...cur,
                        completedVerses: Array.from(completed),
                        verseTimes,
                        lastAccessDate: new Date().toISOString(),
                    },
                },
            };
        });

        return elapsedSeconds; // Return for use by calling component
    }, []);

    /** Increment repetition count for a verse */
    const incrementRepetition = useCallback((surahId, verseIndex) => {
        setState((prev) => {
            const cur = prev.surahProgress[surahId] || {};
            const reps = { ...(cur.repetitions || {}) };
            reps[verseIndex] = (reps[verseIndex] || 0) + 1;
            return {
                ...prev,
                surahProgress: {
                    ...prev.surahProgress,
                    [surahId]: { ...cur, repetitions: reps },
                },
            };
        });
    }, []);

    /** Reset progress for a Surah */
    const resetSurahProgress = useCallback((surahId) => {
        setState((prev) => ({
            ...prev,
            lastActiveVerse: 0,
            surahProgress: {
                ...prev.surahProgress,
                [surahId]: {
                    completedVerses: [],
                    repetitions: {},
                    verseTimes: {},
                    lastAccessDate: new Date().toISOString(),
                },
            },
        }));
    }, []);

    const value = {
        state,
        isLoading,
        initSurah,
        setActiveVerse,
        markVerseCompleted,
        incrementRepetition,
        resetSurahProgress,
    };

    return (
        <UserProgressContext.Provider value={value}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => {
    const ctx = useContext(UserProgressContext);
    if (!ctx) throw new Error("useUserProgress must be inside UserProgressProvider");
    return ctx;
};

export default UserProgressContext;
