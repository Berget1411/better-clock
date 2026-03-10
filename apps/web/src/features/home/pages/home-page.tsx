import { ArrowUpRightIcon, Clock3Icon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Link } from "@tanstack/react-router";
import heroImage from "@/public/example-hero.png";

const GITHUB_URL = "https://github.com/Berget1411/open-clock";

export default function HomePage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_38%)]" />
      <div className="absolute inset-y-0 left-1/2 w-[1200px] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-40 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1680px] flex-col px-6 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <a
            href="/home"
            className="inline-flex items-center gap-3 text-sm font-medium text-white/90"
          >
            <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Clock3Icon className="size-4" />
            </span>
            <span>Open Clock</span>
          </a>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white/90"
          >
            <span>GitHub</span>
            <ArrowUpRightIcon className="size-4" />
          </a>
        </header>

        <main className="flex flex-1 flex-col items-center pt-[8vh] text-center sm:pt-[10vh]">
          <h1 className="max-w-5xl text-balance text-4xl font-medium tracking-[-0.05em] text-white opacity-0 [animation:fade-in_1s_ease-out_forwards] sm:text-6xl lg:text-[5.25rem] lg:leading-[1.05]">
            Open Clock is the best way to track your time.
          </h1>

          <Button
            asChild
            variant="default"
            size="lg"
            className="mt-10 px-10 py-5 text-base font-medium"
          >
            <Link to="/">Go to app</Link>
          </Button>
          <div className="mt-10 w-full max-w-[1400px] opacity-0 [animation:screenshot-in_1s_ease-out_0.15s_forwards]">
            <img
              src={heroImage}
              alt="Open Clock dashboard preview"
              className="block w-full rounded-[24px] border border-white/10 shadow-[0_24px_120px_rgba(0,0,0,0.6)]"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
              }}
            />
          </div>
        </main>

        <footer className="mt-6 flex items-center justify-between gap-4 text-sm text-white/35">
          <p>2026 Open Clock Inc</p>
          <div className="flex items-center gap-6">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white/70"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes screenshot-in {
          from {
            opacity: 0;
            transform: scale(0.98);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
