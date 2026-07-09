import "nextra-theme-docs/style.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const syncTocParent = () => {
      const activeSubheading = document.querySelector(
        '.nextra-toc li > a[class~="ltr:nx-pl-4"].nx-text-primary-600'
      );
      const currentParent = document.querySelector(
        ".nextra-toc li.toc-parent-active"
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

    const toc = document.querySelector(".nextra-toc");

    if (!toc) {
      return;
    }

    syncTocParent();

    const observer = new MutationObserver(syncTocParent);

    observer.observe(toc, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <Component {...pageProps} />;
}
