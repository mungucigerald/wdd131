/*
  recipes.js
  Powers the Recipes explorer page: search, multi-filter, card rendering,
  and favoriting. Reads recipe data from RECIPES (data.js).
*/

function buildCardMarkup(recipe) {
  const favorited = isFavorite(recipe.id);
  const heartLabel = favorited ? "Remove from favorites" : "Save to favorites";
  const heartSymbol = favorited ? "♥" : "♡";

  return `
    <article class="recipe-card" data-recipe-id="${recipe.id}">
      <a class="recipe-card__link" href="recipe.html?id=${recipe.id}">
        <img
          class="recipe-card__image"
          src="${buildSizedImageUrl(recipe.image, 800, 600)}"
          alt="${recipe.alt}"
          width="800"
          height="600"
          loading="lazy"
        />
        <div class="recipe-card__body">
          <p class="recipe-card__meta">${recipe.cuisine} · ${recipe.mealType}</p>
          <h3 class="recipe-card__title">${recipe.title}</h3>
          <ul class="recipe-card__tags">
            <li class="tag">${recipe.diet}</li>
            <li class="tag tag--time">${recipe.prepTime} min</li>
            <li class="tag tag--difficulty">${recipe.difficulty}</li>
          </ul>
        </div>
      </a>
      <button
        type="button"
        class="favorite-button ${favorited ? "is-active" : ""}"
        data-favorite-toggle="${recipe.id}"
        aria-pressed="${favorited}"
        aria-label="${heartLabel} for ${recipe.title}"
      >
        <span aria-hidden="true">${heartSymbol}</span>
      </button>
    </article>
  `;
}

function renderRecipeCards(recipeList) {
  const grid = document.querySelector("[data-recipe-grid]");
  const emptyState = document.querySelector("[data-empty-state]");
  if (!grid) return;

  if (recipeList.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  grid.innerHTML = recipeList.map((recipe) => buildCardMarkup(recipe)).join("");
}

function readFilterState() {
  return {
    query: document.querySelector("[data-search-input]")?.value.trim().toLowerCase() || "",
    cuisine: document.querySelector("[data-filter-cuisine]")?.value || "all",
    mealType: document.querySelector("[data-filter-meal]")?.value || "all",
    diet: document.querySelector("[data-filter-diet]")?.value || "all",
    maxTime: Number(document.querySelector("[data-filter-time]")?.value) || 0,
    favoritesOnly: document.querySelector("[data-filter-favorites]")?.checked || false
  };
}

function matchesFilters(recipe, filters) {
  const matchesQuery =
    filters.query === "" ||
    recipe.title.toLowerCase().includes(filters.query) ||
    recipe.tags.some((tag) => tag.includes(filters.query));

  const matchesCuisine = filters.cuisine === "all" || recipe.cuisine === filters.cuisine;
  const matchesMeal = filters.mealType === "all" || recipe.mealType === filters.mealType;
  const matchesDiet = filters.diet === "all" || recipe.diet === filters.diet;
  const matchesTime = filters.maxTime === 0 || recipe.prepTime <= filters.maxTime;
  const matchesFavorites = !filters.favoritesOnly || isFavorite(recipe.id);

  return matchesQuery && matchesCuisine && matchesMeal && matchesDiet && matchesTime && matchesFavorites;
}

function updateTimeOutput() {
  const timeInput = document.querySelector("[data-filter-time]");
  const timeOutput = document.querySelector("[data-time-output]");
  if (timeInput && timeOutput) {
    timeOutput.textContent = timeInput.value;
  }
}

function applyFilters() {
  updateTimeOutput();
  const filters = readFilterState();
  const filtered = RECIPES.filter((recipe) => matchesFilters(recipe, filters));

  const resultsCount = document.querySelector("[data-results-count]");
  if (resultsCount) {
    const noun = filtered.length === 1 ? "recipe" : "recipes";
    resultsCount.textContent = `${filtered.length} ${noun} found`;
  }

  renderRecipeCards(filtered);
}

function resetFilters() {
  document.querySelectorAll("[data-filter-form] select").forEach((select) => {
    select.value = "all";
  });
  const timeInput = document.querySelector("[data-filter-time]");
  if (timeInput) timeInput.value = timeInput.max;
  const searchInput = document.querySelector("[data-search-input]");
  if (searchInput) searchInput.value = "";
  const favoritesCheckbox = document.querySelector("[data-filter-favorites]");
  if (favoritesCheckbox) favoritesCheckbox.checked = false;

  applyFilters();
}

function prefillFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get("search");
  const dietParam = params.get("diet");
  const favoritesParam = params.get("favorites");

  if (searchTerm) {
    const searchInput = document.querySelector("[data-search-input]");
    if (searchInput) searchInput.value = searchTerm;
  }

  if (dietParam) {
    const dietSelect = document.querySelector("[data-filter-diet]");
    if (dietSelect) dietSelect.value = dietParam;
  }

  if (favoritesParam === "true") {
    const favoritesCheckbox = document.querySelector("[data-filter-favorites]");
    if (favoritesCheckbox) favoritesCheckbox.checked = true;
  }
}

function initRecipeGrid() {
  const grid = document.querySelector("[data-recipe-grid]");
  if (!grid) return;

  prefillFromQueryString();
  applyFilters();

  const filterForm = document.querySelector("[data-filter-form]");
  if (filterForm) {
    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("submit", (event) => event.preventDefault());
  }

  const resetButton = document.querySelector("[data-reset-filters]");
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }

  // Event delegation: one listener handles every favorite button, present or future.
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-toggle]");
    if (!button) return;

    const recipeId = button.dataset.favoriteToggle;
    const nowFavorited = toggleFavorite(recipeId);

    button.classList.toggle("is-active", nowFavorited);
    button.setAttribute("aria-pressed", `${nowFavorited}`);
    button.innerHTML = `<span aria-hidden="true">${nowFavorited ? "♥" : "♡"}</span>`;

    const favoritesOnly = document.querySelector("[data-filter-favorites]")?.checked;
    if (favoritesOnly && !nowFavorited) {
      applyFilters();
    }
  });
}

document.addEventListener("DOMContentLoaded", initRecipeGrid);
