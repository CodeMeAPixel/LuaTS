import * as Twoslash from "fumadocs-twoslash/ui";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import {
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import * as lucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import * as TbIcons from "react-icons/tb";
import * as IoIcons from "react-icons/io5";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mdx/mermaid";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(lucideIcons as unknown as MDXComponents),
    ...(FaIcons as unknown as MDXComponents),
    ...(Fa6Icons as unknown as MDXComponents),
    ...(MdIcons as unknown as MDXComponents),
    ...(TbIcons as unknown as MDXComponents),
    ...(IoIcons as unknown as MDXComponents),
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    ...Twoslash,
    File,
    Files,
    Folder,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tab,
    Accordion,
    InlineTOC,
    Accordions,
    Mermaid,
    TypeTable,
    Callout,
    ...components,
  };
}
