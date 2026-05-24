import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Friend in a Pocket",
    short_name: "FiaP",
    description: "A reflective AI wellness chat companion.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a1040",
    theme_color: "#7c5cff",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
