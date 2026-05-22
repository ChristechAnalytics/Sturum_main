import React from "react";
import { Link as LinkScroll } from "react-scroll";

const SECTION_LINKS = [
  { to: "home", label: "Home" },
  { to: "about", label: "About" },
  { to: "features", label: "Features" },
];

const SCROLL_OFFSET = -80;

const ScrollLinks = ({ variant = "desktop", onItemClick, itemClassName }) => {
  const scrollLinkClass =
    variant === "mobile"
      ? itemClassName ||
        "block w-full min-w-[240px] max-w-xs text-center py-4 px-8 text-xl font-bold text-neutral-900 rounded-xl border-2 border-neutral-200 bg-neutral-50 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 transition-colors cursor-pointer shadow-sm"
      : "cursor-pointer text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-1";

  if (variant === "mobile") {
    return SECTION_LINKS.map(({ to, label }) => (
      <li key={to} className="w-full flex justify-center">
        <LinkScroll
          to={to}
          smooth
          offset={SCROLL_OFFSET}
          duration={500}
          spy
          onClick={onItemClick}
          className={scrollLinkClass}
        >
          {label}
        </LinkScroll>
      </li>
    ));
  }

  return (
    <ul className="hidden md:flex items-center gap-1 ml-6">
      {SECTION_LINKS.map(({ to, label }) => (
        <li key={to}>
          <LinkScroll
            to={to}
            smooth
            offset={SCROLL_OFFSET}
            duration={500}
            spy
            className={scrollLinkClass}
          >
            {label}
          </LinkScroll>
        </li>
      ))}
    </ul>
  );
};

export default ScrollLinks;
