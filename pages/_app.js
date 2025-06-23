
import '../src/app/globals.css';

// This _app.js file is the entry point for all pages in the `pages` directory.
// It's kept minimal to avoid conflicts with the App Router. Global providers
// are handled in the App Router's layout (src/app/layout.tsx).
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
