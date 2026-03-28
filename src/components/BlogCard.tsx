import { useCallback, useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~01";

function glitchText(original: string, progress: number): string {
  const result: string[] = [];
  for (let i = 0; i < original.length; i++) {
    if (original[i] === " " || original[i] === "\n") {
      result.push(original[i]);
      continue;
    }
    const threshold = i / original.length;
    if (progress > threshold) {
      result.push(original[i]);
    } else {
      result.push(GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
    }
  }
  return result.join("");
}

type BlogCardProps = {
  category?: string;
  title: string;
  author?: string;
  date: string;
};

export function BlogCard({ category, title, author, date }: BlogCardProps) {
  const [hovered, setHovered] = useState(false);
  const [glitchProgress, setGlitchProgress] = useState(1);
  const frameRef = useRef(0);
  const startTimeRef = useRef(0);

  const DECODE_DURATION = 600;

  useEffect(() => {
    if (!hovered) return;

    setGlitchProgress(0);
    startTimeRef.current = performance.now();

    function tick() {
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(elapsed / DECODE_DURATION, 1);
      const eased = p * p * (3 - 2 * p);
      setGlitchProgress(eased);
      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [hovered]);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => {
    setHovered(false);
    setGlitchProgress(1);
  }, []);

  const isGlitching = hovered && glitchProgress < 1;

  const displayTitle = isGlitching ? glitchText(title, glitchProgress) : title;
  const displayAuthor =
    author && isGlitching ? glitchText(author, glitchProgress) : author;
  const displayDate = isGlitching ? glitchText(date, glitchProgress) : date;
  const displayCategory =
    category && isGlitching ? glitchText(category, glitchProgress) : category;

  return (
    <div
      className="blog-card group"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {displayCategory && (
        <span className="blog-card-category">{displayCategory}</span>
      )}

      <h3 className="blog-card-title">{displayTitle}</h3>

      <div className="blog-card-meta">
        {displayAuthor && <span>{displayAuthor}</span>}
        <span>{displayDate}</span>
      </div>
    </div>
  );
}
