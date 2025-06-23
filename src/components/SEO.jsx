import Head from "next/head";

export default function SEO({
  title = "SagePostAI | The AI infrastructure layer for social media — automated, intelligent, autonomous.",
  description = "SagePostAI is the AI layer for social media — built to help creators and brands automate every post, grow faster, and scale effortlessly with intelligent workflows.",
  keywords = "SagePostAI, AI social media tool, automate posts, AI content planner, GPT social media, AI scheduler",
  url = "https://sagepostai.com",
  image = "https://sagepostai.com/og-image.png",
}) {
  const structuredDataOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SagePostAI",
    url: url,
    logo: image,
    description: description,
    sameAs: [],
    founder: {
      "@type": "Person",
      name: "SagePostAI Team",
    },
  };

  const structuredDataWeb = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SagePostAI",
    alternateName: "SPAI",
    url: url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="SagePostAI Team" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta property="twitter:domain" content="sagepostai.com" />
      <meta property="twitter:url" content={url} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataWeb) }}
      />
    </Head>
  );
}
