import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";
import type { ReactNode } from "react";
import { baseOptions, linkItems } from "@/app/layout.config";
import { source } from "@/lib/source";
import "katex/dist/katex.min.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions}
      tree={source.pageTree}
      links={linkItems.filter((item) => item.type === "icon")}
      nav={{
        ...baseOptions.nav,
        title: (
          <>
            <Image
              src="/sidebanner.webp"
              alt="Logo"
              width="90"
              height="90"
            />
          </>
        ),
      }}
      sidebar={{
        tabs: {
          transform(option, node) {
            const meta = source.getNodeMeta(node);
            if (!meta || !node.icon) return option;

            const color = `var(--${meta.path.split("/")[0]}-color, var(--color-fd-foreground))`;

            return {
              ...option,
              icon: (
                <div
                  className="size-full rounded-lg max-md:border max-md:bg-(--tab-color)/10 max-md:p-1.5 [&_svg]:size-full"
                  style={
                    {
                      color,
                      "--tab-color": color,
                    } as object
                  }
                >
                  {node.icon}
                </div>
              ),
            };
          },
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
