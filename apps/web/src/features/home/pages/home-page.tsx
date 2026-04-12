import { useState } from "react";
import { ArrowUpRightIcon, ChevronRightIcon, ImageOffIcon } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { useTheme } from "next-themes";

import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import { Link } from "@tanstack/react-router";

import heroDark from "@/public/hero-image-dark.png";
import heroLight from "@/public/hero-image-light.png";
import logoSvg from "@/public/logo.svg";

const GITHUB_URL = "https://github.com/Berget1411/open-clock";

function HeroImageFallback() {
  return (
    <div
      className="flex h-48 w-full flex-col items-center justify-center gap-2 bg-muted/20 text-muted-foreground"
      role="img"
      aria-label="Dashboard preview unavailable"
    >
      <ImageOffIcon className="size-5 shrink-0" aria-hidden="true" />
      <p className="text-xs">Preview unavailable</p>
    </div>
  );
}

export default function HomePage() {
  const [heroError, setHeroError] = useState(false);
  const { resolvedTheme } = useTheme();
  const heroSrc = resolvedTheme === "light" ? heroLight : heroDark;

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-background text-foreground">
        <m.header
          className="border-b border-border/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link
              to="/"
              aria-label="better clock home"
              className="inline-flex min-h-11 min-w-0 items-center gap-3 text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center border border-border bg-muted"
                aria-hidden="true"
              >
                <img src={logoSvg} alt="" className="size-9 dark:invert" />
              </span>
              <span className="min-w-0 truncate">better clock</span>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                Beta
              </Badge>
            </Link>

            <nav aria-label="Site navigation">
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="h-11 px-3 text-xs text-muted-foreground">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="better clock on GitHub (opens in new tab)"
                  >
                    <span aria-hidden="true">GitHub</span>
                    <ArrowUpRightIcon className="size-4 rtl:rotate-[270deg]" aria-hidden="true" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="h-11 px-4 text-xs">
                  <Link to="/app">Open app</Link>
                </Button>
              </div>
            </nav>
          </div>
        </m.header>

        <main>
          <section
            aria-label="Product overview"
            className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16"
          >
            <m.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <h1 className="[overflow-wrap:anywhere] text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Know where the work went.
              </h1>
              <p className="mt-4 [overflow-wrap:anywhere] text-sm leading-6 text-muted-foreground sm:text-base">
                Precise time tracking for freelancers and small teams.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="group h-11 px-4 text-sm">
                  <Link to="/app">
                    Go to app
                    <ChevronRightIcon
                      className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-11 px-4 text-sm">
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
                    GitHub
                    <ArrowUpRightIcon className="size-4 rtl:rotate-[270deg]" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </m.div>

            <m.div
              className="relative ring-1 ring-foreground/10 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-1/3 after:bg-gradient-to-t after:from-background after:to-transparent"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              {heroError ? (
                <HeroImageFallback />
              ) : (
                <img
                  src={heroSrc}
                  alt="better clock dashboard showing tracked hours, recent activity, and reporting views."
                  loading="lazy"
                  decoding="async"
                  onError={() => setHeroError(true)}
                  className="block h-auto w-full bg-muted/20"
                />
              )}
            </m.div>
          </section>
        </main>

        <footer className="border-t border-border/70">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground sm:px-6">
            <p>© 2026 better clock</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="better clock on GitHub (opens in new tab)"
              className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
            >
              <span aria-hidden="true">GitHub</span>
              <ArrowUpRightIcon className="size-4 rtl:rotate-[270deg]" aria-hidden="true" />
            </a>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
