"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { requestAdBreak } from "@/lib/adsense";
import { PlayCircle, ShieldCheck, X } from "lucide-react";

export default function RewardedAdModal() {
  const { rewardedAdModal, closeRewardedAdModal } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);

  if (!rewardedAdModal?.isOpen) return null;

  const handleWatchAd = async () => {
    setIsPlaying(true);
    let secondsLeft = 5;
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Call AdSense H5 SDK
    await requestAdBreak({
      type: "reward",
      name: `revive_${rewardedAdModal.gameSlug}`,
      onAdViewed: () => {
        clearInterval(interval);
        setIsPlaying(false);
        rewardedAdModal.onRewardSuccess();
        closeRewardedAdModal();
      },
      onAdDismissed: () => {
        clearInterval(interval);
        setIsPlaying(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl text-center text-white">
        {!isPlaying && (
          <button
            onClick={closeRewardedAdModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-100">
          {isPlaying ? "Sponsored Video Playing..." : "Don't Break Your Streak!"}
        </h3>

        <p className="mt-2 text-sm text-slate-300">
          {isPlaying
            ? `Your revival reward will unlock in ${countdown} seconds.`
            : "Watch a quick 5-second video ad to revive your daily run, recover your guesses, and keep your streak alive!"}
        </p>

        {isPlaying ? (
          <div className="mt-6 flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Google AdSense H5 SDK • pub-5643499410858608
            </span>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleWatchAd}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
            >
              <PlayCircle className="w-5 h-5" />
              Watch Ad to Revive (+1 Life)
            </button>
            <button
              onClick={closeRewardedAdModal}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-800 transition"
            >
              No thanks, end game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
