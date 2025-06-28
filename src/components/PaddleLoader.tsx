
"use client";

import Script from 'next/script';

declare global {
  interface Window {
    Paddle: any;
  }
}

export function PaddleLoader() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
          window.Paddle.Environment.set("sandbox");
          window.Paddle.Initialize({
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          });
        } else {
          console.warn("Paddle client token is not set. Checkout will not function.");
        }
      }}
    />
  );
}
