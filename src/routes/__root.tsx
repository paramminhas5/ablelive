import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

import { Header } from "@/components/Header";
import { TransportProvider } from "@/components/TransportProvider";
import { MasterTransportBar } from "@/components/MasterTransportBar";
import { CommandPalette } from "@/components/CommandPalette";
import { Onboarding } from "@/components/HomeWidgets";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-4">
      <div className="max-w-md text-center brutal-border bg-card p-8 brutal-shadow">
        <h1 className="text-7xl font-display">404</h1>
        <h2 className="mt-4 text-xl font-display">SIGNAL LOST</h2>
        <p className="mt-2 text-sm font-mono">This route is not on the grid.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ABLETON.SCHOOL — Learn Ableton Live 12, Brutally Interactive" },
      {
        name: "description",
        content:
          "A gamified, interactive learning system for Ableton Live 12. Missions, simulators, XP. Cover the entire manual.",
      },
      { name: "author", content: "ABLETON.SCHOOL" },
      {
        property: "og:title",
        content: "ABLETON.SCHOOL — Learn Ableton Live 12, Brutally Interactive",
      },
      {
        property: "og:description",
        content:
          "A gamified, interactive learning system for Ableton Live 12. Missions, simulators, XP. Cover the entire manual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "ABLETON.SCHOOL — Learn Ableton Live 12, Brutally Interactive",
      },
      {
        name: "twitter:description",
        content:
          "A gamified, interactive learning system for Ableton Live 12. Missions, simulators, XP. Cover the entire manual.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c50e31e5-eb8c-4cc9-ad9a-bc948d5719c2",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c50e31e5-eb8c-4cc9-ad9a-bc948d5719c2",
      },
      { name: "theme-color", content: "#CDFF00" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AnimatedOutlet() {
  const router = useRouterState();
  const key = router.location.pathname;
  return (
    <main className="flex-1 animate-fade-in" key={key}>
      <Outlet />
    </main>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <TransportProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-bone text-ink pb-24">
          <Header />
          <AnimatedOutlet />
          <footer className="brutal-border border-x-0 border-b-0 bg-ink text-bone p-6 font-mono text-xs uppercase tracking-widest">
            ABLETON.SCHOOL — UNOFFICIAL · BUILT FOR THE GRID · 2026
          </footer>
        </div>
        <MasterTransportBar />
        <CommandPalette />
        <Onboarding />
      </QueryClientProvider>
    </TransportProvider>
  );
}
