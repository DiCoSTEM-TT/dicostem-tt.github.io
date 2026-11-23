(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };

  const updateHeight = () => {
    document.documentElement.style.setProperty('--navigation-height', header.offsetHeight + 'px');
  };
  new ResizeObserver(updateHeight).observe(header);
  updateHeight();
  onScroll(); // estado correcto si se aterriza ya con scroll
  window.addEventListener('scroll', onScroll, { passive: true });
})();
