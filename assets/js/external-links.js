(function () {
  function configureExternalLink(link) {
    const url = new URL(link.href, document.baseURI);
    if (!["http:", "https:"].includes(url.protocol) || url.origin === location.origin) {
      return;
    }
    link.target = "_blank";
    link.relList.add("noopener", "noreferrer");
  }

  function configureLinks() {
    document.querySelectorAll("a[href]").forEach(configureExternalLink);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", configureLinks, { once: true });
  } else {
    configureLinks();
  }

  // Includes links created or updated after the initial page load.
  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");
    if (link) configureExternalLink(link);
  }, true);
})();
