"use client"

import { Card, Cards } from "fumadocs-ui/components/card";
import { motion } from "framer-motion"
import { FaGithub, FaCode, FaExchangeAlt, FaChevronLeft, FaCheckCircle, FaTools, FaBook, FaPuzzlePiece } from "react-icons/fa"
import { SiTypescript, SiLua } from "react-icons/si"
import Link from "next/link"
import  HomeBuilders  from "./code"
import { Install } from "./install"

function Button({
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline"
}) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
    outline: "border border-border text-foreground hover:bg-muted focus:ring-ring"
  }
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}

function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="text-muted-foreground">{children}</div>
}

export default function Component() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const featureList = [
    {
      icon: FaExchangeAlt,
      title: "Type Conversion",
      description: "Converts Lua/Luau type declarations into TypeScript interfaces seamlessly.",
    },
    {
      icon: SiTypescript,
      title: "TypeScript Mapping",
      description: "Maps Lua types to TypeScript equivalents (string, number, boolean, etc.).",
    },
    {
      icon: FaCheckCircle,
      title: "Optional Types",
      description: "Supports optional types (e.g., `foo: string?` becomes `foo?: string`).",
    },
    {
      icon: FaCode,
      title: "Table & Function Types",
      description:
        "Handles complex table types (`{string}` → `string[]`) and converts Luau function types to TS arrow functions.",
    },
    {
      icon: FaBook,
      title: "JSDoc Preservation",
      description: "Preserves comments and maps them directly to JSDoc format in TypeScript.",
    },
    {
      icon: FaTools,
      title: "CLI Tooling",
      description: "Includes a robust CLI tool for single-file or batch directory conversion with various options.",
    },
    {
      icon: FaPuzzlePiece,
      title: "Plugin System",
      description: "Extend type generation with a powerful plugin hook system for custom transforms.",
    },
    {
      icon: FaCode,
      title: "Programmatic API",
      description: "Offers a comprehensive programmatic API for integration into your build workflows.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    LuaTS: Seamless <span className="text-primary">Lua/Luau</span> to{" "}
                    <span className="text-primary">TypeScript</span> Type Conversion
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A powerful library for parsing, formatting, and providing robust TypeScript interfaces for your Lua
                    and Luau codebases.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/docs" className="bg-secondary dark:bg-muted flex items-center gap-x-3 rounded-full border px-6 py-2 text-start outline-none transition-colors">
  <FaChevronLeft className="mr-2 h-4 w-4" />
  Get Started
</Link>
<Link
  href="https://github.com/CodeMeAPixel/luats"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-secondary dark:bg-muted flex items-center gap-x-3 rounded-full border px-6 py-2 text-start outline-none transition-colors"
>
  <FaGithub className="mr-2 h-4 w-4" />
  View on GitHub
</Link>
<Install />

                </div>
              </motion.div>
              <motion.div
                className="hidden lg:flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <SiLua className="h-48 w-48 text-primary-foreground/20 dark:text-primary/20" />
                <SiTypescript className="h-48 w-48 text-primary-foreground/20 dark:text-primary/20 -ml-12" />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="code" className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
  <HomeBuilders />
  </motion.div>
</div>
      </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LuaTS provides a comprehensive set of tools to bridge your Lua/Luau code with TypeScript.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              {featureList.map((feature, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full" title={""}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contribution Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn}>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contribute to LuaTS</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                LuaTS is an open-source project and welcomes contributions from the community. Whether it's bug fixes,
                new features, or documentation improvements, your help is valuable!
              </p>
              <Link
  href="https://github.com/CodeMeAPixel/luats/blob/main/CONTRIBUTING.md"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-secondary dark:bg-muted flex items-center gap-x-3 rounded-full border px-6 py-2 text-center outline-none transition-colors"
>
  <FaGithub className="mr-2 h-4 w-4" />
  Contribution Guide
</Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background text-muted-foreground">
        <p className="text-xs">&copy; {"2024-2025 CodeMeAPixel. All rights reserved."}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="https://github.com/CodeMeAPixel/luats/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            License (MIT)
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="https://github.com/CodeMeAPixel/luats"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </nav>
      </footer>
    </div>
  )
}
