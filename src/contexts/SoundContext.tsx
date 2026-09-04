/* eslint-disable react-refresh/only-export-components -- context + hook module */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BGM_STORAGE_KEY = "onchain-reality-bgm-enabled";
const SFX_STORAGE_KEY = "onchain-reality-sfx-enabled";

function readStored(key: string): boolean | null {
  try {
    const v = localStorage.getItem(key);
    if (v === "true") return true;
    if (v === "false") return false;
  } catch {
    /* private mode or quota */
  }
  return null;
}

type SoundContextValue = {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  bgmStatus: BgmPlaybackStatus;
  enableBgm: () => void;
  disableBgm: () => void;
  toggleBgm: () => void;
  toggleSfx: () => void;
  muteAll: () => void;
  setBgmStatus: (status: BgmPlaybackStatus) => void;
  registerBgmPlaybackRequest: (handler: (() => void) | null) => void;
};

export type BgmPlaybackStatus =
  | "loading"
  | "playing"
  | "paused"
  | "unavailable";

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(
    () => readStored(BGM_STORAGE_KEY) ?? false,
  );
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(
    () => readStored(SFX_STORAGE_KEY) ?? false,
  );
  const [bgmStatus, setBgmStatus] = useState<BgmPlaybackStatus>("paused");
  const bgmPlaybackRequestRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(BGM_STORAGE_KEY, String(bgmEnabled));
    } catch {
      /* ignore */
    }
  }, [bgmEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(SFX_STORAGE_KEY, String(sfxEnabled));
    } catch {
      /* ignore */
    }
  }, [sfxEnabled]);

  const enableBgm = useCallback(() => {
    setBgmEnabled(true);
    bgmPlaybackRequestRef.current?.();
  }, []);

  const disableBgm = useCallback(() => {
    setBgmEnabled(false);
  }, []);

  const toggleBgm = useCallback(() => {
    if (bgmEnabled) {
      setBgmEnabled(false);
      return;
    }

    setBgmEnabled(true);
    bgmPlaybackRequestRef.current?.();
  }, [bgmEnabled]);

  const toggleSfx = useCallback(() => {
    setSfxEnabled((prev) => !prev);
  }, []);

  const muteAll = useCallback(() => {
    setBgmEnabled(false);
    setSfxEnabled(false);
  }, []);

  const registerBgmPlaybackRequest = useCallback(
    (handler: (() => void) | null) => {
      bgmPlaybackRequestRef.current = handler;
    },
    [],
  );

  const value = useMemo(
    () => ({
      bgmEnabled,
      sfxEnabled,
      bgmStatus,
      enableBgm,
      disableBgm,
      toggleBgm,
      toggleSfx,
      muteAll,
      setBgmStatus,
      registerBgmPlaybackRequest,
    }),
    [
      bgmEnabled,
      sfxEnabled,
      bgmStatus,
      enableBgm,
      disableBgm,
      toggleBgm,
      toggleSfx,
      muteAll,
      registerBgmPlaybackRequest,
    ],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return ctx;
}
