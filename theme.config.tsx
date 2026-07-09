import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>WEB-CODING</span>,
  feedback: {
    content: null,
  },
  editLink: {
    component: null,
  },
  toc: {
    title: "На этой странице",
  },
  themeSwitch: {
    useOptions() {
      return {
        light: "Светлая",
        dark: "Тёмная",
        system: "Системная",
      };
    },
  },
  search: {
    placeholder: "Поиск по сайту...",
  },
  footer: {
    text: "mihascor-studio © 2026",
  },
};

export default config;
