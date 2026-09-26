"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ADSENSE_CLIENT_ID } from "@/lib/adsense";

export default function AdSenseH5Provider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.adsbygoogle = window.adsbygoogle || [];
      if (!window.adConfig) {
        window.adConfig = (args: any) => {
          console.log("[AdSense H5] adConfig registered:", args);
        };
      }
      window.adConfig({
        preloadAdBreaks: "on",
        sound: "on",
      });
    }
  }, []);

  return (
    <>
      <Script
        id="adsbygoogle-h5-sdk"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
        data-ad-frequency-hint="30s"
        data-adbreak-test="on"
      />
    </>
  );
}
