// pages/pricing.js

import HomePage from "./index"; // Adjust path if your homepage is elsewhere
import { useEffect } from "react";

export default function PricingPage() {
  useEffect(() => {
    const el = document.getElementById("pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return <HomePage />;
}
