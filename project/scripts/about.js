/*
  about.js
  Validates and stores the "Suggest a recipe / send feedback" form
  from about.html, and renders a running list of recent submissions.
*/

const FEEDBACK_KEY = "myr-feedback-submissions";

function getFeedbackEntries() {
  const stored = localStorage.getItem(FEEDBACK_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveFeedbackEntry(entry) {
  const entries = getFeedbackEntries();
  entries.push(entry);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
}

function validateFeedbackForm(formData) {
  const errors = {};

  if (formData.name.length < 2) {
    errors.name = "Please enter your name (at least 2 characters).";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (formData.message.length < 10) {
    errors.message = "Tell us a bit more \u2014 at least 10 characters.";
  }

  return errors;
}

function displayErrors(errors) {
  document.querySelectorAll(".form-error").forEach((el) => {
    el.textContent = "";
  });

  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  });
}

function buildFeedbackItemMarkup(entry) {
  const categoryLabel = entry.category === "recipe" ? "Recipe idea" : "General feedback";
  return `
    <li class="feedback-item">
      <p class="feedback-item__meta">${categoryLabel} · ${entry.date}</p>
      <p class="feedback-item__name">${entry.name}</p>
      <p class="feedback-item__message">${entry.message}</p>
    </li>
  `;
}

function renderRecentFeedback() {
  const list = document.querySelector("[data-feedback-list]");
  if (!list) return;

  const entries = getFeedbackEntries();
  const emptyState = document.querySelector("[data-feedback-empty]");

  if (entries.length === 0) {
    list.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  const recentFirst = [...entries].reverse().slice(0, 5);
  list.innerHTML = recentFirst.map((entry) => buildFeedbackItemMarkup(entry)).join("");
}

function initFeedbackForm() {
  const form = document.querySelector("[data-feedback-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      category: form.elements.category.value,
      message: form.elements.message.value.trim()
    };

    const errors = validateFeedbackForm(formData);
    displayErrors(errors);

    const confirmation = document.querySelector("[data-form-confirmation]");

    if (Object.keys(errors).length > 0) {
      if (confirmation) confirmation.hidden = true;
      return;
    }

    saveFeedbackEntry({
      ...formData,
      date: new Date().toLocaleDateString()
    });

    form.reset();
    renderRecentFeedback();

    if (confirmation) {
      confirmation.hidden = false;
      confirmation.textContent = `Thanks, ${formData.name}! Your ${formData.category === "recipe" ? "recipe idea" : "feedback"} has been received.`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFeedbackForm();
  renderRecentFeedback();
});
