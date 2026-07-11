import "nextra-theme-docs/style.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

const tocStorageKey = "web-coding:toc-headings-only";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const getSavedState = () => {
      try {
        return localStorage.getItem(tocStorageKey) === "true";
      } catch {
        return false;
      }
    };

    const saveState = (isHeadingsOnly: boolean) => {
      try {
        localStorage.setItem(tocStorageKey, String(isHeadingsOnly));
      } catch {
        // Ignore storage errors in private browsing or restricted environments.
      }
    };

    const syncCollapsedActiveParent = (toc: HTMLElement) => {
      const currentParent = toc.querySelector(".toc-parent-active");

      if (!toc.classList.contains("toc-headings-only")) {
        currentParent?.classList.remove("toc-parent-active");
        return;
      }

      const activeSubheading = toc.querySelector(
        '.nextra-toc li > a[class~="ltr:nx-pl-4"].nx-text-primary-600'
      );

      if (!activeSubheading) {
        currentParent?.classList.remove("toc-parent-active");
        return;
      }

      let item = activeSubheading.parentElement?.previousElementSibling;
      let nextParent: Element | null = null;

      while (item) {
        const link = item.querySelector(":scope > a");

        if (link && !link.classList.contains("ltr:nx-pl-4")) {
          nextParent = item;
          break;
        }

        item = item.previousElementSibling;
      }

      if (currentParent === nextParent) {
        return;
      }

      currentParent?.classList.remove("toc-parent-active");
      nextParent?.classList.add("toc-parent-active");
    };

    const setupTocToggle = () => {
      const toc = document.querySelector<HTMLElement>(".nextra-toc");
      const title = toc?.querySelector<HTMLElement>("p");

      if (!toc || !title) {
        return;
      }

      const applyState = (
        button: HTMLButtonElement,
        isHeadingsOnly: boolean
      ) => {
        toc.classList.toggle("toc-headings-only", isHeadingsOnly);
        syncCollapsedActiveParent(toc);
        button.setAttribute("aria-expanded", String(!isHeadingsOnly));
        button.setAttribute(
          "aria-label",
          isHeadingsOnly
            ? "Показать заголовки третьего уровня"
            : "Скрыть заголовки третьего уровня"
        );
      };

      const existingButton =
        title.querySelector<HTMLButtonElement>(".toc-toggle-button");

      if (existingButton) {
        applyState(existingButton, getSavedState());
        return;
      }

      if (!toc.dataset.parentActiveObserver) {
        toc.dataset.parentActiveObserver = "true";

        const parentActiveObserver = new MutationObserver(() => {
          syncCollapsedActiveParent(toc);
        });

        parentActiveObserver.observe(toc, {
          attributes: true,
          attributeFilter: ["class"],
          childList: true,
          subtree: true,
        });
      }

      const button = document.createElement("button");

      button.type = "button";
      button.className = "toc-toggle-button";
      title.classList.add("toc-title-with-toggle");
      title.append(button);

      applyState(button, getSavedState());

      button.addEventListener("click", () => {
        const nextState = !toc.classList.contains("toc-headings-only");

        saveState(nextState);
        applyState(button, nextState);
      });
    };

    setupTocToggle();

    const observer = new MutationObserver(setupTocToggle);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <Component {...pageProps} />;
}
