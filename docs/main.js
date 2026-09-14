// Shared behavior across all pages: mobile nav toggle.
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".nav-menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("nav-links-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }
});
