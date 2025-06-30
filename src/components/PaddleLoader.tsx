
"use client";

import Script from 'next/script';

declare global {
  interface Window {
    Paddle: any;
  }
}

export function PaddleLoader() {
  const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (paddleToken) {
          window.Paddle.Initialize({
            token: paddleToken.trim(),
          });
        } else {
          console.warn("Paddle client token is not set. Checkout will not function.");
        }
      }}
    />
  );
}
