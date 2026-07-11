import React from "react";
import {
  Blocks,
  Bot,
  Database,
  GitBranch,
  Globe,
  LibraryBig,
  Network,
  PanelsTopLeft,
  Rocket,
  ServerCog,
  ShieldCheck,
  TableProperties,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { DocsThemeConfig } from "nextra-theme-docs";

const categoryIcons: Record<string, LucideIcon> = {
  "/01_bazovoe-ponimanie-veba": Globe,
  "/02_osnova-interfejsa": PanelsTopLeft,
  "/03_rabota-s-dannymi": TableProperties,
  "/04_backend-i-servernaya-logika": ServerCog,
  "/05_bazy-dannyh": Database,
  "/06_arhitektura-veb-prilozheniya": Network,
  "/07_instrumenty-razrabotchika": Wrench,
  "/08_frejmvorki-i-sovremennye-podhody": Blocks,
  "/09_rabota-s-kodom-i-versiyami": GitBranch,
  "/10_kachestvo-i-bezopasnost": ShieldCheck,
  "/11_publikaciya-i-podderzhka": Rocket,
  "/12_rabota-s-ai-assistentom": Bot,
  "/13_dopolnitelnye-temy-dlya-rasshireniya-serii": LibraryBig,
};

function SidebarTitle({ title, route }: { title: string; route: string }) {
  const Icon = categoryIcons[route];

  if (!Icon) {
    return <>{title}</>;
  }

  return (
    <span className="sidebar-category-title">
      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      <span>{title}</span>
    </span>
  );
}

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
  sidebar: {
    titleComponent: SidebarTitle,
  },
  footer: {
    text: "mihascor-studio © 2026",
  },
};

export default config;
