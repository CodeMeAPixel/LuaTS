import type { InferMetaType, InferPageType } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";
import { icons as LucideIcons } from "lucide-react";
import { createElement } from "react";
import { docs } from "../../.source";
import { IconType } from "react-icons";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as Fa6Icons from "react-icons/fa6";
import * as TbIcons from "react-icons/tb";
import * as IoIcons from "react-icons/io5";
import { IconContainer } from "@/components/layout/global/icon";

export const source = loader({
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in MdIcons) {
      const IconComponent = MdIcons[icon as keyof typeof MdIcons] as IconType;
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
    if (icon && icon in FaIcons) {
      const IconComponent = FaIcons[icon as keyof typeof FaIcons] as IconType;
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
    if (icon && icon in Fa6Icons) {
      const IconComponent = Fa6Icons[icon as keyof typeof Fa6Icons] as IconType;
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
    if (icon && icon in IoIcons) {
      const IconComponent = IoIcons[icon as keyof typeof IoIcons] as IconType;
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
    if (icon && icon in TbIcons) {
      const IconComponent = TbIcons[icon as keyof typeof TbIcons] as IconType;
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
    if (icon && icon in LucideIcons) {
      const IconComponent = LucideIcons[icon as keyof typeof LucideIcons];
      return createElement(IconContainer, {
        icon: IconComponent,
      });
    }
  },
  source: docs.toFumadocsSource(),
  pageTree: {
    attachFile,
  },
});

export const openapi = createOpenAPI({
  proxyUrl: "/api/proxy",
  shikiOptions: {
    themes: {
      light: "tokyo-night",
      dark: "tokyo-night",
    },
  },
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;
