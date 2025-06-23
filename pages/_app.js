
// This file is no longer needed for styling as global styles are imported in src/app/layout.tsx.
// It is kept to handle any remaining pages router routes if necessary.
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
