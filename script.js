const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const menuNav = document.querySelector("[data-menu-nav]");
const contactForm = document.querySelector("[data-contact-form]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const menuLinks = Array.from(document.querySelectorAll(".menu-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

menuToggle?.addEventListener("click", () => {
  const isOpen = menuNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

[...navLinks, ...menuLinks].forEach((link) => {
  link.addEventListener("click", () => {
    menuNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const updateHeader = () => {
  header?.classList.toggle("has-shadow", window.scrollY > 8);
};

const updateActiveLink = () => {
  const current = sections.reduce((active, section) => {
    const top = section.getBoundingClientRect().top;
    return top <= 120 ? section : active;
  }, sections[0]);

  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`));
  menuLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`));
};

window.addEventListener("scroll", () => {
  updateHeader();
  updateActiveLink();
});

updateHeader();
updateActiveLink();

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const senderEmail = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const body = [
    `Sender email: ${senderEmail}`,
    "",
    "Message:",
    message
  ].join("\n");

  const mailto = new URL("mailto:mmaniruzzaman@crimson.ua.edu");
  mailto.searchParams.set("subject", subject || "Portfolio message");
  mailto.searchParams.set("body", body);
  window.location.href = mailto.toString();
});
