import React from "react";
import Image from "next/image";

export default function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/products/sagepostai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-sagepostai"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=985466&theme=light&t=1751342131153"
        alt="SagePostAI - Automate social media. Dominate with AI | Product Hunt"
        width={250}
        height={54}
      />
    </a>
  );
}
