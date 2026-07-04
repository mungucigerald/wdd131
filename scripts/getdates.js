const yearSpan = document.querySelector("#currentyear");

const today = new Date();

yearSpan.textContent = today.getFullYear();


const lastModifiedParagraph = document.querySelector("#lastModified");


lastModifiedParagraph.textContent = `Last Modification: ${document.lastModified}`;
