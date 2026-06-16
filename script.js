const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const contactForm = document.querySelector("[data-contact-form]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
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

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
  });
};

window.addEventListener("scroll", () => {
  updateHeader();
  updateActiveLink();
});

updateHeader();
updateActiveLink();

contactForm?.addEventListener("submit", (event) => {
  const formData = new FormData(contactForm);
  const subject = String(formData.get("subject") || "").trim();
  const subjectOutput = contactForm.querySelector("[data-subject-output]");

  subjectOutput.value = subject || "New portfolio message";
});
