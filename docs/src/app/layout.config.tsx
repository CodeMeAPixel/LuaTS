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
    url: "https://antiraid.xyz/discord",
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
          description: "How to guide on setting up AntiRaid",
          url: "/docs/user",
        },
        {
          icon: <FaBook />,
          text: "Developer's Guide",
          description:
            "Everything you need to know about AntiRaid's infrastructure.",
          url: "/docs/dev",
        },
        {
          icon: <FaDownload />,
          text: "Setup Guide",
          description:
            "Everything you need to know on how to setup AntiRaid on your local server.",
          url: "/docs/dev/hosting",
        },
      ],
    },
    ...linkItems,
  ],
};
