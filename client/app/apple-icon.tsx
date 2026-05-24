import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #5e44c8 0%, #9d7cff 100%)",
          borderRadius: 40,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.95)",
            fontSize: 76,
            lineHeight: 1,
            display: "flex",
          }}
        >
          ✦
        </span>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
