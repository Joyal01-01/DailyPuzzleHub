"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT_ID } from "@/lib/adsense";

interface AdSenseBannerProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  responsive?: boolean;
}

export default function AdSenseBanner({
  slot = "1234567890",
  format = "auto",
  responsive = true,
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.log("[AdSense] Banner slot pushed:", e);
    }
  }, []);

  return (
    <div className="my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        Advertisement • Google AdSense H5
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <div className="h-12 w-full max-w-lg rounded-lg border border-dashed border-slate-700/50 bg-slate-800/40 flex items-center justify-center text-xs text-slate-400">
        Google Ad Slot (pub-5643499410858608)
      </div>
    </div>
  );
}
