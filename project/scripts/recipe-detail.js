/*
  recipe-detail.js
  Renders a single recipe on recipe.html based on the ?id= query parameter.
*/

function findRecipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

function buildIngredientListMarkup(ingredients) {
  return ingredients.map((item) => `<li>${item}</li>`).join("");
}

function buildStepListMarkup(steps) {
  return steps.map((step, index) => `
    <li 
      class="step-list__item"
      tabindex="0" data-step-image="${buildSizedImageUrl(step.image, 600, 450)}" 
      data-step-alt="${step.alt}"
      >
      <span class="step-number" aria-hidden="true">${index + 1}</span>
      <p>${step.text}</p>
    </li>
  `).join("");
}

function renderNotFound(container) {
  container.innerHTML = `
    <div class="not-found">
      <h1>Recipe not found</h1>
      <p>We could not find a recipe that matches this link. It may have been renamed or removed.</p>
      <a class="button button--primary" href="recipes.html">Browse all recipes</a>
    </div>
  `;
}

function renderRecipe(recipe) {
  document.title = `${recipe.title} | Mind Your Recipe`;

  const container = document.querySelector("[data-recipe-detail]");
  if (!container) return;

  const favorited = isFavorite(recipe.id);

  container.innerHTML = `
    <div class="recipe-detail__media">
      <img src="${buildSizedImageUrl(recipe.image, 800, 600)}" alt="${recipe.alt}" width="800" height="600" loading="eager" fetchpriority="high" />
    </div>
    <div class="recipe-detail__content">
      <p class="recipe-detail__meta">${recipe.cuisine} · ${recipe.mealType}</p>
      <h1>${recipe.title}</h1>
      <p class="recipe-detail__description">${recipe.description}</p>

      <dl class="recipe-stats">
        <div class="recipe-stats__item">
          <dt>Prep time</dt>
          <dd>${recipe.prepTime} min</dd>
        </div>
        <div class="recipe-stats__item">
          <dt>Difficulty</dt>
          <dd>${recipe.difficulty}</dd>
        </div>
        <div class="recipe-stats__item">
          <dt>Calories</dt>
          <dd>${recipe.calories} kcal</dd>
        </div>
        <div class="recipe-stats__item">
          <dt>Servings</dt>
          <dd>${recipe.servings}</dd>
        </div>
        <div class="recipe-stats__item">
          <dt>Diet</dt>
          <dd>${recipe.diet}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="favorite-button favorite-button--large ${favorited ? "is-active" : ""}"
        data-favorite-toggle="${recipe.id}"
        aria-pressed="${favorited}"
      >
        <span aria-hidden="true">${favorited ? "♥" : "♡"}</span>
        <span data-favorite-label>${favorited ? "Saved to favorites" : "Save to favorites"}</span>
      </button>

      <section class="recipe-detail__section" aria-labelledby="ingredients-heading">
        <h2 id="ingredients-heading">Ingredients</h2>
        <ul class="ingredient-list">${buildIngredientListMarkup(recipe.ingredients)}</ul>
      </section>

      <section class="recipe-detail__section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">Instructions</h2>
        <p class="steps-hint">Hover, focus or tap a step to preview</p>
        <div class="steps-with-preview" data-step-preview>
          <ol class="step-list" data-step-list>${buildStepListMarkup(recipe.steps)}</ol>
          <figure class="step-preview" data-step-preview>
            <img data-step-preview-image src="${buildSizedImageUrl(recipe.image, 600, 450)}" alt="${recipe.alt}" loading="lazy" />
            <figcaption data-step-preview-caption>${recipe.alt}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  `;

  initStepImagePreview(container, recipe);

  const favoriteButton = container.querySelector("[data-favorite-toggle]");
  favoriteButton.addEventListener("click", () => {
    const nowFavorited = toggleFavorite(recipe.id);
    favoriteButton.classList.toggle("is-active", nowFavorited);
    favoriteButton.setAttribute("aria-pressed", `${nowFavorited}`);
    favoriteButton.querySelector("span[aria-hidden]").textContent = nowFavorited ? "♥" : "♡";
    favoriteButton.querySelector("[data-favorite-label]").textContent = nowFavorited
      ? "Saved to favorites"
      : "Save to favorites";
  });
}

function initStepImagePreview(container, recipe) {
  const stepList = container.querySelector("[data-step-list]");
  const previewImage = container.querySelector("[data-step-preview-image]");
  const previewCaption = container.querySelector("[data-step-preview-caption]");

  if (!stepList || !previewImage) return;

  const defaultImage = buildSizedImageUrl(recipe.image, 600, 450);
  const defaultCaption = recipe.alt;

  function showStepPreview(stepItem) {

    const imageUrl = stepItem.dataset.stepImage;
    const altText = stepItem.dataset.stepAlt;

    if (!imageUrl) return;

    previewImage.src = imageUrl;
    previewImage.alt = altText;
    if (previewCaption) previewCaption.textContent = altText;

    stepList.querySelectorAll(".step-list__item").forEach((item) => {
      item.classList.toggle("is-previewing", item === stepItem)
    });
  }


  function resetStepPreview() {
    previewImage.src = defaultImage;
    previewImage.alt = defaultCaption;
    if (previewCaption) previewCaption.textContent = defaultCaption;

    stepList.querySelectorAll(".step-list__item").forEach((item) => { item.classList.remove("is-previewing"); });
  }

  // Event delegation to the event listeners
  // Mouse hover
  stepList.addEventListener("mouseover", (event) => {
    const stepItem = event.target.closest(".step-list__item");
    if (stepItem) showStepPreview(stepItem);
  });

  stepList.addEventListener("mouseleave", resetStepPreview);

  // Keyboard focus
  stepList.addEventListener("focusin", (event) => {
    const stepItem = event.target.closest(".step-list__item");
    if (stepItem) showStepPreview(stepItem);
  });

  stepList.addEventListener("focusout", (event) => {
    if (!stepList.contains(event.relatedTarget)) {
      resetStepPreview();
    }
  });

  stepList.addEventListener("click", (event) => {
    const stepItem = event.target.closest(".step-list__item");
    if (stepItem) showStepPreview(stepItem);
  });
}

function renderRelatedRecipes(currentRecipe) {
  const relatedContainer = document.querySelector("[data-related-recipes]");
  if (!relatedContainer) return;

  const related = RECIPES
    .filter((recipe) => recipe.id !== currentRecipe.id && recipe.mealType === currentRecipe.mealType)
    .slice(0, 3);

  if (related.length === 0) {
    const parentSection = relatedContainer.closest("section");
    if (parentSection) parentSection.hidden = true;
    return;
  }

  relatedContainer.innerHTML = related.map((recipe) => `
    <a class="related-card" href="recipe.html?id=${recipe.id}">
      <img src="${buildSizedImageUrl(recipe.image, 600, 450)}" alt="${recipe.alt}" width="400" height="300" loading="lazy" />
      <p>${recipe.title}</p>
    </a>
  `).join("");
}

function initRecipeDetail() {
  const container = document.querySelector("[data-recipe-detail]");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");
  const recipe = recipeId ? findRecipeById(recipeId) : undefined;

  if (!recipe) {
    renderNotFound(container);
    return;
  }

  renderRecipe(recipe);
  renderRelatedRecipes(recipe);
}

document.addEventListener("DOMContentLoaded", initRecipeDetail);
