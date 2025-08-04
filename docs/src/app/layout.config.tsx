import { GithubInfo } from "fumadocs-ui/components/github-info";
import type { LinkItemType } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { FaBook, FaCogs, FaDiscord, FaDownload } from "react-icons/fa";
import { SiGithub } from "react-icons/si";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

export const linkItems: LinkItemType[] = [
  {
    type: "icon",
    url: "https://discord.gg/3z65bpPWhC",
    text: "Support",
    icon: <FaDiscord />,
    external: true,
  },
  {
    type: "icon",
    url: "https://github.com/CodeMeAPixel",
    text: "Github",
    icon: <SiGithub />,
    external: true,
  },
];

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width="32"
            height="32"
          />
          <h1>LuaTS</h1>
        </div>
      </>
    ),
    transparentMode: "top",
  },
  links: [
    {
      type: "menu",
      text: "Docs",
      items: [
        {
          icon: <FaCogs />,
          text: "User Guide",
          description: "How to guide on setting up LuaTS",
          url: "/docs/user",
        },
        {
          icon: <FaBook />,
          text: "API Refrence",
          description:
            "API level knowledge for using LuaTS",
          url: "/docs/api-refrence",
        },
        {
          icon: <FaDownload />,
          text: "Plugins",
          description:
            "LuaTS provides a comprehensive plugin system that allows you to customize and extend the type generation process.",
          url: "/docs/plugins",
        },
      ],
    },
    ...linkItems,
  ],
};
