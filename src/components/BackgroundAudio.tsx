import { useCallback, useEffect, useRef } from "react";
import { useSound } from "../contexts/SoundContext";

const BGM_SRC = "/audio/music/bgm.mp3";
const LOOP_GAP_MS = 5000;
const FADE_DURATION_MS = 800;
const FADE_STEP_MS = 50;
const MAX_VOLUME_DESKTOP = 1;
const MAX_VOLUME_MOBILE = 0.1;

function maxVolume() {
  return navigator.maxTouchPoints > 0 ? MAX_VOLUME_MOBILE : MAX_VOLUME_DESKTOP;
}

/** Headless BGM engine. Playback only starts after an explicit user action. */
export function BackgroundAudio() {
  const { bgmEnabled, bgmStatus, setBgmStatus, registerBgmPlaybackRequest } =
    useSound();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wantsPlaybackRef = useRef(bgmEnabled);
  const hasPlayedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    if (loopRef.current) clearTimeout(loopRef.current);
    fadeRef.current = null;
    loopRef.current = null;
  }, []);

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const steps = Math.max(1, FADE_DURATION_MS / FADE_STEP_MS);
    const delta = (target - audio.volume) / steps;
    let remaining = steps;
    fadeRef.current = setInterval(() => {
      remaining -= 1;
      audio.volume = Math.max(
        0,
        Math.min(1, remaining === 0 ? target : audio.volume + delta),
      );
      if (remaining === 0) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        done?.();
      }
    }, FADE_STEP_MS);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearTimers();
    wantsPlaybackRef.current = true;
    setBgmStatus("loading");
    audio.volume = 0;
    void audio
      .play()
      .then(() => {
        hasPlayedRef.current = true;
        setBgmStatus("playing");
        fadeTo(maxVolume());
      })
      .catch(() => setBgmStatus("unavailable"));
  }, [clearTimers, fadeTo, setBgmStatus]);

  useEffect(() => {
    registerBgmPlaybackRequest(play);
    return () => registerBgmPlaybackRequest(null);
  }, [play, registerBgmPlaybackRequest]);

  useEffect(() => {
    wantsPlaybackRef.current = bgmEnabled;
    if (!bgmEnabled) {
      clearTimers();
      fadeTo(0, () => {
        audioRef.current?.pause();
        setBgmStatus("paused");
      });
    }
  }, [bgmEnabled, clearTimers, fadeTo, setBgmStatus]);

  useEffect(() => {
    if (!bgmEnabled || bgmStatus === "playing" || hasPlayedRef.current) return;
    const resume = () => {
      play();
      document.removeEventListener("pointerdown", resume, true);
      document.removeEventListener("keydown", resume, true);
    };
    document.addEventListener("pointerdown", resume, true);
    document.addEventListener("keydown", resume, true);
    return () => {
      document.removeEventListener("pointerdown", resume, true);
      document.removeEventListener("keydown", resume, true);
    };
  }, [bgmEnabled, bgmStatus, play]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <audio
      ref={audioRef}
      src={BGM_SRC}
      preload="none"
      onEnded={() => {
        setBgmStatus("paused");
        if (!wantsPlaybackRef.current) return;
        loopRef.current = setTimeout(() => {
          if (wantsPlaybackRef.current) play();
        }, LOOP_GAP_MS);
      }}
      onError={() => setBgmStatus("unavailable")}
    />
  );
}
