(() => {
  const header = document.querySelector('body:not(.login-page) header');

  if (!header) return;

  const updateHeader = () => {
    const offset = Math.min(window.scrollY, 96);
    header.style.setProperty('--header-scroll-offset', `${offset}px`);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
