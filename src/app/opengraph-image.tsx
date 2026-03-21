import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CHES Study Hub — York College Health and Human Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #E24B38 0%, #C73A28 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#E24B38",
            }}
          >
            C
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          CHES Study Hub
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.9)",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          York College — Department of Health and Human Performance
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255, 255, 255, 0.75)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
          }}
        >
          Prepare for the Certified Health Education Specialist Exam
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
