/*
  home.js
  Handles the hero search bar and renders the featured recipe row on index.html.
*/

function buildFeaturedCardMarkup(recipe) {
  return `
    <a class="featured-card" href="recipe.html?id=${recipe.id}">
      <img
        class="featured-card__image"
        src="${buildSizedImageUrl(recipe.image, 800, 600)}"
        alt="${recipe.alt}"
        width="800"
        height="600"
        loading="lazy"
      />
      <div class="featured-card__body">
        <h3>${recipe.title}</h3>
        <p class="featured-card__meta">${recipe.prepTime} min · ${recipe.diet}</p>
      </div>
    </a>
  `;
}

function renderFeaturedRecipes() {
  const row = document.querySelector("[data-featured-row]");
  if (!row) return;

  const quickPicks = RECIPES.filter((recipe) => recipe.prepTime <= 20);
  const featured = quickPicks.length >= 3 ? quickPicks.slice(0, 3) : RECIPES.slice(0, 3);

  row.innerHTML = featured.map((recipe) => buildFeaturedCardMarkup(recipe)).join("");
}

function initHeroSearch() {
  const heroForm = document.querySelector("[data-hero-search]");
  if (!heroForm) return;

  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = heroForm.querySelector("input[type='search']");
    const query = input.value.trim();

    const destination = query
      ? `recipes.html?search=${encodeURIComponent(query)}`
      : "recipes.html";

    window.location.href = destination;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedRecipes();
  initHeroSearch();
});
