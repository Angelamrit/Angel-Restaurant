import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Typographic favicon/app icon in the same gold-wine/espresso tokens as
// app/opengraph-image.tsx, until the client supplies an approved logo mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#25130D",
          color: "#E5C88F",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 340,
        }}
      >
        a
      </div>
    ),
    { ...size }
  );
}
