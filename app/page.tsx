"use client";

import { useEffect, useState } from "react";

const targetDate = new Date("2026-03-15T00:00:00").getTime();

function getTimeLeft() {
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function HomePage() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl mb-6">Estamos actualizando la página...</h1>

      {timeLeft ? (
        <div className="text-2xl font-semibold">
          Disponible nuevamente en:
          <div className="mt-4">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
            {timeLeft.seconds}s
          </div>
        </div>
      ) : (
        <div className="text-2xl font-semibold">
          ¡La página ya está disponible!
        </div>
      )}
    </div>
  );
}

export default HomePage;
