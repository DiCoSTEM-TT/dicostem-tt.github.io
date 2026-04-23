document.addEventListener("click", function (event) {
  var button = event.target.closest(".reveal-email");
  if (!button) return;

  var isRevealed = button.classList.contains("is-revealed");
  var showLabel = button.getAttribute("data-label-show") || "Show email";
  var hideLabel = button.getAttribute("data-label-hide") || "Hide email";

  if (isRevealed) {
    button.textContent = showLabel;
    button.classList.remove("is-revealed");
    return;
  }

  var user = button.getAttribute("data-user");
  var domain = button.getAttribute("data-domain");
  if (!user || !domain) return;

  button.textContent = user + "@" + domain;
  button.classList.add("is-revealed");
  button.setAttribute("aria-label", hideLabel);
});
