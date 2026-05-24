import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const size = Math.min(512, Math.max(32, parseInt(url.searchParams.get("size") ?? "192", 10)));
  const radius = Math.round(size * 0.22);
  const starSize = Math.round(size * 0.42);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #5e44c8 0%, #9d7cff 100%)",
          borderRadius: radius,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.95)",
            fontSize: starSize,
            lineHeight: 1,
            display: "flex",
          }}
        >
          ✦
        </span>
      </div>
    ),
    { width: size, height: size },
  );
}
