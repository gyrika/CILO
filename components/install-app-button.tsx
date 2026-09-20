"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setInstalled(isStandalone);

    function handleBeforeInstallPrompt(event: Event) {
      // Stop Chrome's automatic mini-infobar; we show our own button instead.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Nothing to show: already installed, or the browser hasn't told us the
  // site is installable yet (e.g. iOS Safari never fires this event at all).
  if (installed || !installEvent) {
    return null;
  }

  async function handleClick() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
    >
      Install app
    </button>
  );
}
