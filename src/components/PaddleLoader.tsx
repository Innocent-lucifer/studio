
"use client";

import Script from 'next/script';

declare global {
  interface Window {
    Paddle: any;
  }
}

export function PaddleLoader() {
  const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "test_cf963617e34d2af675ce87ab957";

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (paddleToken) {
          window.Paddle.Environment.set("sandbox");
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
