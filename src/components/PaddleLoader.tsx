
"use client";

import Script from 'next/script';

declare global {
  interface Window {
    Paddle: any;
  }
}

export function PaddleLoader() {
  const paddleToken = "apikey_01jyzqf3wf40736sky345whwya";

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (paddleToken) {
          // Sandbox environment setting is removed for live mode.
          window.Paddle.Initialize({
            token: paddleToken,
          });
        } else {
          console.warn("Paddle client token is not set. Checkout will not function.");
        }
      }}
    />
  );
}
