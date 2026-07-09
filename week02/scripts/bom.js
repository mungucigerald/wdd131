// INITIALIZE VARIABLES
const input = document.querySelector("#favchap");
const button = document.querySelector("button");
const list = document.querySelector("#list");



button.addEventListener("click", function() {
    if (input.value.trim() != "") {
        const listItem = document.createElement("li");
        listItem.textContent = input.value;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌"

        listItem.appendChild(deleteButton);
        list.appendChild(listItem);

        input.value = "";

        deleteButton.addEventListener("click", function () {
            list.removeChild(listItem);
            input.focus();
        })
    }   

    input.focus();
})