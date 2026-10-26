"use client";

import { useEffect, useRef } from "react";

const navigationEvent = "contacts:before-navigation";
const warning =
  "You have unsaved contact changes. Leave this page and discard them?";

/** Used by button-driven navigation as well as ordinary links. */
export function confirmContactNavigation() {
  return window.dispatchEvent(new Event(navigationEvent, { cancelable: true }));
}

export function useUnsavedChanges(dirty: boolean, message = warning) {
  const allowNavigation = useRef(false);
  useEffect(() => {
    if (!dirty) return;
    allowNavigation.current = false;
    const currentUrl = window.location.href;
    const confirm = (event: Event) => {
      if (!allowNavigation.current && !window.confirm(message))
        event.preventDefault();
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!allowNavigation.current) event.preventDefault();
    };
    const click = (event: MouseEvent) => {
      if (allowNavigation.current) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const destination = new URL(link.href);
      if (destination.protocol !== "http:" && destination.protocol !== "https:")
        return;
      if (
        destination.href === window.location.href ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search &&
          destination.hash)
      )
        return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const pop = (event: PopStateEvent) => {
      if (allowNavigation.current || window.confirm(message)) return;
      event.stopImmediatePropagation();
      // Restore the current editor before Next processes a cancelled traversal.
      window.history.pushState(null, "", currentUrl);
    };
    window.addEventListener(navigationEvent, confirm);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop, true);
    return () => {
      window.removeEventListener(navigationEvent, confirm);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", pop, true);
    };
  }, [dirty, message]);
  // Successful submission may navigate before effect cleanup runs.
  return () => {
    allowNavigation.current = true;
  };
}
