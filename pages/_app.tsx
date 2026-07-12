import "nextra-theme-docs/style.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

const tocStorageKey = "web-coding:toc-headings-only";
const sidebarStorageKey = "web-coding:sidebar-categories";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const progressContainer = document.createElement("div");
    const progressIndicator = document.createElement("div");
    const progressLabel = document.createElement("span");
    let animationFrame = 0;

    progressContainer.className = "article-reading-progress-container";
    progressIndicator.className = "article-reading-progress";
    progressLabel.className = "article-reading-progress-label";
    progressLabel.setAttribute("aria-hidden", "true");
    progressContainer.append(progressIndicator, progressLabel);
    document.body.append(progressContainer);

    const updateProgress = () => {
      animationFrame = 0;

      const article = document.querySelector<HTMLElement>(".nextra-content");

      if (!article) {
        progressIndicator.style.transform = "scaleX(0)";
        progressLabel.style.left = "0%";
        progressLabel.style.transform = "translate(0, -100%)";
        progressLabel.textContent = "0%";
        return;
      }

      const articleTop = window.scrollY + article.getBoundingClientRect().top;
      const headerHeight = document.querySelector("header")?.offsetHeight || 64;
      const scrollableHeight = Math.max(
        article.offsetHeight - window.innerHeight + headerHeight,
        1
      );
      const progress = Math.min(
        Math.max((window.scrollY - articleTop + headerHeight) / scrollableHeight, 0),
        1
      );

      progressIndicator.style.transform = `scaleX(${progress})`;
      progressLabel.style.left = `${progress * 100}%`;
      progressLabel.style.transform = `translate(${progress === 0 ? 0 : progress === 1 ? -100 : -50}%, -100%)`;
      progressLabel.textContent = `${Math.round(progress * 100)}%`;
    };

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    router.events.on("routeChangeComplete", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      router.events.off("routeChangeComplete", scheduleUpdate);
      window.cancelAnimationFrame(animationFrame);
      progressContainer.remove();
    };
  }, [router.events]);

  useEffect(() => {
    const openCurrentArticleCategory = () => {
      const activeArticle = document.querySelector<HTMLAnchorElement>(
        ".nextra-sidebar-container li.active > a[href]"
      );
      const categoryButtons: HTMLButtonElement[] = [];
      let parent = activeArticle?.parentElement?.parentElement;

      while (parent) {
        if (parent.matches("li")) {
          const categoryButton = parent.querySelector<HTMLButtonElement>(
            ":scope > button"
          );

          if (categoryButton && !parent.classList.contains("open")) {
            categoryButtons.unshift(categoryButton);
          }
        }

        parent = parent.parentElement;
      }

      categoryButtons.forEach((button) => button.click());
    };

    const handleRouteChange = () => {
      window.requestAnimationFrame(openCurrentArticleCategory);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  useEffect(() => {
    const setupSidebarCollapseButton = () => {
      const sidebar = document.querySelector<HTMLElement>(
        ".nextra-sidebar-container"
      );

      if (!sidebar) {
        return;
      }

      if (sidebar.dataset.collapseButtonAdded) {
        return;
      }

      const button = document.createElement("button");

      button.type = "button";
      button.className = "sidebar-collapse-button";
      button.textContent = "Свернуть меню";
      button.setAttribute("aria-label", "Свернуть раскрытые категории");
      button.addEventListener("click", () => {
        sidebar
          .querySelectorAll<HTMLButtonElement>("li.open > button")
          .forEach((categoryButton) => categoryButton.click());
      });

      sidebar.dataset.collapseButtonAdded = "true";
      sidebar.prepend(button);
    };

    setupSidebarCollapseButton();

    const observer = new MutationObserver(setupSidebarCollapseButton);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    type SidebarState = Record<string, boolean>;
    let hasRestoredState = false;

    const getFolderKey = (button: HTMLButtonElement) =>
      button.textContent?.trim() || "";

    const getSavedState = (): SidebarState => {
      try {
        const savedState = JSON.parse(
          localStorage.getItem(sidebarStorageKey) || "{}"
        );

        return typeof savedState === "object" && savedState !== null
          ? savedState
          : {};
      } catch {
        return {};
      }
    };

    const saveState = () => {
      const sidebarState: SidebarState = {};

      document
        .querySelectorAll<HTMLButtonElement>(
          ".nextra-sidebar-container li > button"
        )
        .forEach((button) => {
          const folder = button.closest("li");
          const key = getFolderKey(button);

          if (folder && key) {
            sidebarState[key] = folder.classList.contains("open");
          }
        });

      try {
        localStorage.setItem(sidebarStorageKey, JSON.stringify(sidebarState));
      } catch {
        // Ignore storage errors in private browsing or restricted environments.
      }
    };

    const restoreState = () => {
      if (hasRestoredState) {
        return;
      }

      const savedState = getSavedState();
      const categoryButtons = document.querySelectorAll<HTMLButtonElement>(
        ".nextra-sidebar-container li > button"
      );

      if (!categoryButtons.length) {
        return;
      }

      categoryButtons.forEach((button) => {
          if (button.dataset.sidebarStateInitialized) {
            return;
          }

          const folder = button.closest("li");
          const key = getFolderKey(button);

          if (!folder || !key) {
            return;
          }

          button.dataset.sidebarStateInitialized = "true";

          const isOpen = folder.classList.contains("open");
          const shouldBeOpen = savedState[key] ?? false;

          if (isOpen !== shouldBeOpen) {
            button.click();
          }
        });

      hasRestoredState = true;
    };

    const handleSidebarClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>(
        ".nextra-sidebar-container li > button"
      );

      if (button) {
        saveState();
      }
    };

    restoreState();
    document.addEventListener("click", handleSidebarClick);

    const observer = new MutationObserver(restoreState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", handleSidebarClick);
      observer.disconnect();
    };
  }, []);

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
