
// This file is intentionally structured this way to resolve a potential route conflict.
// By using getServerSideProps, we explicitly tell Next.js this path is not found,
// ceding control to the App Router. The pricing section is available on the homepage at /#pricing.

export async function getServerSideProps() {
  return {
    notFound: true,
  };
}

export default function InactivePricing() {
  return null;
}
