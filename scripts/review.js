// Constant parameters to be searched in the URL
const params = new URLSearchParams(window.location.search);

// Check for values "product" & "rating" in URL to verify visit from review page
if (params.has("product") && params.has("rating")) {
    // Get the current count, default is 0
    let reviewCount = parseInt(localStorage.getItem("reviewCount")) || 0;

    // Increment for the review count
    reviewCount++;

    // Save the review count 
    localStorage.setItem("reviewCount", reviewCount);

    // Reset url to remove the search parameters
    history.replaceState(null, "", window.location.pathname);
}

// Display the count on page
const counterDisplay = document.querySelector("#reviewCount");
if (counterDisplay) {
    counterDisplay.textContent = localStorage.getItem("reviewCount") || 0;
}