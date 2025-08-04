import type { ImageResponseOptions } from "next/dist/compiled/@vercel/og/types";
import { ImageResponse } from "next/og";
import type { ReactElement, ReactNode } from "react";

const title = "LuaTS";

interface GenerateProps {
  title: ReactNode;
  tag: string;
  description?: ReactNode;
  primaryTextColor?: string;
}

export function generateOGImage(
  options: GenerateProps & ImageResponseOptions,
): ImageResponse {
  const { title, tag, description, primaryTextColor, ...rest } = options;

  return new ImageResponse(
    generate({
      title,
      tag,
      description,
      primaryTextColor,
    }),
    {
      width: 1200,
      height: 630,
      ...rest,
    },
  );
}

export function generate({
  primaryTextColor = "rgb(255,150,255)",
  ...props
}: GenerateProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "white",
        backgroundImage:
          "radial-gradient(145% 145% at 110% 110%, hsl(270,100%,86%) 0%, hsl(270,23%,20%) 30%, hsl(256, 78%, 47%, 1.00) 60%, hsl(0, 0.00%, 0.00%) 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "4rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            marginBottom: "auto",
            color: primaryTextColor,
          }}
        >
          <img
            src="https://raw.githubusercontent.com/CodeMeAPixel/LuaTS/ccebab352538f86cf5347bc81bbd1e0db409cbb3/docs/public/logo.svg"
            alt="LuaTS Logo"
            width={58}
            height={58}
            style={{
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
          <p
            style={{
              fontSize: "46px",
              fontWeight: 600,
            }}
          >
            {title}
          </p>
        </div>
        <p
          style={{
            fontWeight: 600,
            fontSize: "26px",
            textTransform: "uppercase",
          }}
        >
          {props.tag.replace(/-/g, " ")}
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "56px",
          }}
        >
          {props.title}
        </p>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(240,240,240,0.7)",
          }}
        >
          {props.description}
        </p>
      </div>
    </div>
  );
}
