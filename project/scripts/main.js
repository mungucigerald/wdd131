/*
  main.js
  Runs on every page. Handles the mobile nav toggle, the footer year,
  and the shared "favorites" localStorage helpers other scripts build on.
*/

const FAVORITES_KEY = "myr-favorite-recipes";

// -------Image sizing helper-------
// Grabs a URL for an image ans returs a resized version to a given width and height
// Free proxy (images.weserve.nl) resizes image URLs regardless of hosting site
function buildSizedImageUrl(url, width, height) {
  let parsed;
  try {
    parsed = new URL(url, window.location.href);
  } catch (error) {
    return url;     //check and returns unchanged URL if its not usable
  }

  const isLocalFile = parsed.origin === window.location.origin;
  if (isLocalFile) {
    return url
  }

  // Strip protocol from URL before its processes from the proxy
  const sourceURL = parsed.href.replace(/^https:?\/\//, "");

  const proxy = new URL("https://images.weserv.nl/");
  proxy.searchParams.set("url", sourceURL);
  proxy.searchParams.set("w", `${width}`);
  if (height) proxy.searchParams.set("h", `${height}`);
  proxy.searchParams.set("fit", "cover");
  proxy.searchParams.set("q", "80")

  return proxy.toString();
}

// ---- Favorites helpers (shared across recipes.js, recipe-detail.js, home.js) ----

function getFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

function isFavorite(recipeId) {
  return getFavorites().includes(recipeId);
}

function toggleFavorite(recipeId) {
  const current = getFavorites();
  const alreadySaved = current.includes(recipeId);

  const updated = alreadySaved
    ? current.filter((id) => id !== recipeId)
    : [...current, recipeId];

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  updateFavoritesBadge();
  return !alreadySaved;
}

function updateFavoritesBadge() {
  const badge = document.querySelector("[data-favorites-count]");
  if (!badge) return;

  const count = getFavorites().length;
  badge.textContent = `${count}`;
  badge.hidden = count === 0;
}

// ---- Mobile navigation ----

function initNavToggle() {
  const toggleButton = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".site-nav__list");

  if (!toggleButton || !navList) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", `${isOpen}`);
    toggleButton.textContent = isOpen ? "Close menu ✕" : "Menu ☰";
  });
}

// ---- Header height (used by sticky elements like the step preview) ----

function setHeaderHeightVar() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const setVar = () => {
    document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
  };

  setVar();
  window.addEventListener("resize", setVar);
}

// ---- Footer year ----

function setFooterYear() {
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = `${new Date().getFullYear()}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  setFooterYear();
  updateFavoritesBadge();
  setHeaderHeightVar();
});