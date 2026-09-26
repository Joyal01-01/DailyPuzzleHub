// Google AdSense H5 Games SDK integration for DailyPuzzleHub
// Publisher ID: pub-5643499410858608

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5643499410858608";

declare global {
  interface Window {
    adsbygoogle?: any[];
    adBreak?: (options: any) => void;
    adConfig?: (options: any) => void;
  }
}

export interface ShowAdOptions {
  type: "start" | "pause" | "next" | "browse" | "reward";
  name: string;
  onAdViewed?: () => void;
  onAdDismissed?: () => void;
  beforeAd?: () => void;
  afterAd?: () => void;
}

export function requestAdBreak(options: ShowAdOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (typeof window.adBreak === "function") {
      window.adBreak({
        type: options.type,
        name: options.name,
        beforeAd: () => {
          if (options.beforeAd) options.beforeAd();
        },
        afterAd: () => {
          if (options.afterAd) options.afterAd();
          resolve(true);
        },
        adBreakDone: (placementInfo: any) => {
          console.log("[AdSense H5] adBreakDone:", placementInfo);
          resolve(true);
        },
        beforeReward: (showAdFn: () => void) => {
          showAdFn();
        },
        adDismissed: () => {
          console.log("[AdSense H5] Rewarded ad dismissed by user");
          if (options.onAdDismissed) options.onAdDismissed();
          resolve(false);
        },
        adViewed: () => {
          console.log("[AdSense H5] Rewarded ad viewed successfully");
          if (options.onAdViewed) options.onAdViewed();
          resolve(true);
        },
      });
    } else {
      // Graceful fallback for local development or ad-blocked environments
      console.log(`[AdSense H5 Simulation] Playing ${options.type} ad: ${options.name}`);
      if (options.beforeAd) options.beforeAd();
      setTimeout(() => {
        if (options.type === "reward" && options.onAdViewed) {
          options.onAdViewed();
        }
        if (options.afterAd) options.afterAd();
        resolve(true);
      }, 1200);
    }
  });
}
