import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          borderRadius: "10px",
          backgroundColor: "#00bc7d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        🍻
      </div>
    ),
    { ...size },
  );
}
