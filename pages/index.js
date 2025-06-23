// This file uses getServerSideProps to explicitly tell Next.js that this route
// should not be handled by the Pages Router, resolving the conflict with src/app/page.tsx.

export async function getServerSideProps() {
  return {
    notFound: true,
  };
}

// A default export is required for getServerSideProps to be recognized,
// but it will never be rendered.
export default function InactiveHomepage() {
  return null;
}
