"use client";

import { useEffect, useRef, useState } from "react";

const phrases = [
  "LIDERAZGO",
  "PASIÓN",
  "PERSEVERANCIA",
  "RESILIENCIA",
  "HUMILDAD",
  "INTEGRIDAD",
  "COMPROMISO",
  "DISCIPLINA",
];

export default function TypingText() {
  const [text, setText] = useState("");

  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);
  const lastTime = useRef(0);

  const typingSpeed = 90;
  const deletingSpeed = 40;
  const pauseTime = 1000;

  useEffect(() => {
    let raf: number;

    const loop = (time: number) => {
      const phrase = phrases[phraseIndex.current];
      const speed = deleting.current ? deletingSpeed : typingSpeed;

      if (time - lastTime.current > speed) {
        lastTime.current = time;

        if (!deleting.current) {
          charIndex.current++;

          if (charIndex.current > phrase.length) {
            deleting.current = true;
            lastTime.current = time + pauseTime;
          }
        } else {
          charIndex.current--;

          if (charIndex.current === 0) {
            deleting.current = false;
            phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
          }
        }

        setText(phrase.slice(0, charIndex.current));
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="py-4 text-xl font-semibold text-neutral-600 dark:text-neutral-300">
      <span className="typing-effect">{text}</span>

      <style jsx>{`
        .typing-effect {
          display: inline;
          white-space: nowrap;
          border-right: 3px solid;
          padding-right: 4px;
          animation: blink-caret 0.7s step-end infinite;
        }

        @keyframes blink-caret {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
