import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        borderRadius: "8px",
        border: "1px solid #d6c390",
        color: "#d6c390",
        fontFamily: "serif",
        fontSize: 25,
        backgroundColor: "#092d22",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      B
    </div>,
    { ...size },
  );
}
