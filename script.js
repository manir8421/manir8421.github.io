const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const menuNav = document.querySelector("[data-menu-nav]");
const contactForm = document.querySelector("[data-contact-form]");
const projectsContainer = document.querySelector("[data-projects]");
const gallery = document.querySelector("[data-gallery]");
const galleryTrack = document.querySelector("[data-gallery-track]");
const galleryCurrent = document.querySelector("[data-gallery-current]");
const galleryTotal = document.querySelector("[data-gallery-total]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");
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

const initializeProjects = async () => {
  if (!projectsContainer) return;

  try {
    const response = await fetch(`current-projects.txt?v=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (!response.ok) throw new Error(`Project file returned ${response.status}`);

    const text = await response.text();
    const projects = text
      .split(/^\s*---+\s*$/m)
      .map((block) => {
        const project = {};
        let activeField = "";

        block.split(/\r?\n/).forEach((rawLine) => {
          const line = rawLine.trim();
          if (!line || line.startsWith("#")) return;

          const separator = line.indexOf(":");
          if (separator > -1) {
            const key = line.slice(0, separator).trim().toLowerCase();
            const value = line.slice(separator + 1).trim();
            const fields = {
              title: "title",
              "short description": "description",
              "funding information": "funding"
            };

            if (fields[key]) {
              activeField = fields[key];
              project[activeField] = value;
              return;
            }
          }

          if (activeField) project[activeField] = `${project[activeField]} ${line}`.trim();
        });

        return project;
      })
      .filter((project) => project.title || project.description || project.funding);

    projectsContainer.replaceChildren();

    projects.forEach((project) => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const description = document.createElement("p");
      const funding = document.createElement("div");
      const fundingLabel = document.createElement("span");
      const fundingText = document.createElement("p");

      article.className = "project-card";
      title.textContent = project.title || "Current Project";
      description.textContent = project.description || "Description forthcoming.";
      funding.className = "project-funding";
      fundingLabel.textContent = "Funding Information";
      fundingText.textContent = project.funding || "Funding information forthcoming.";
      funding.append(fundingLabel, fundingText);
      article.append(title, description, funding);
      projectsContainer.append(article);
    });

    if (!projects.length) {
      const status = document.createElement("p");
      status.className = "projects-status";
      status.textContent = "Project information will be updated soon.";
      projectsContainer.append(status);
    }
  } catch (error) {
    const status = document.createElement("p");
    status.className = "projects-status";
    status.textContent = "Project information is temporarily unavailable.";
    projectsContainer.replaceChildren(status);
    console.warn("Unable to load current projects.", error);
  }
};

void initializeProjects();

const initializeGallery = async () => {
  if (!gallery || !galleryTrack) return;

  const apiUrl = "https://api.github.com/repos/manir8421/manir8421.github.io/contents/Web_Image";
  const imagePattern = /\.(avif|gif|jpe?g|png|webp)$/i;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10"
      }
    });

    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const contents = await response.json();
    const images = contents
      .filter((item) => item.type === "file" && imagePattern.test(item.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    galleryTrack.replaceChildren();

    images.forEach((item, index) => {
      const slide = document.createElement("figure");
      const image = document.createElement("img");
      const localPath = item.path.split("/").map(encodeURIComponent).join("/");
      const readableName = item.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

      slide.className = "gallery-slide";
      slide.dataset.gallerySlide = "";
      image.src = localPath;
      image.alt = readableName ? `Gallery photo: ${readableName}` : `Gallery photo ${index + 1}`;
      image.loading = index === 0 ? "eager" : "lazy";
      slide.append(image);
      galleryTrack.append(slide);
    });
  } catch (error) {
    console.warn("Using the embedded gallery image list.", error);
  }

  const gallerySlides = Array.from(galleryTrack.querySelectorAll("[data-gallery-slide]"));
  if (!gallerySlides.length) {
    gallery.hidden = true;
    return;
  }

  let galleryIndex = 0;
  let galleryTimer;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gallery.hidden = false;
  galleryTotal.textContent = String(gallerySlides.length);
  galleryPrev.hidden = gallerySlides.length < 2;
  galleryNext.hidden = gallerySlides.length < 2;

  const showGallerySlide = (index) => {
    galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
    galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
    galleryCurrent.textContent = String(galleryIndex + 1);
  };

  const stopGallery = () => window.clearInterval(galleryTimer);
  const startGallery = () => {
    stopGallery();
    if (!reduceMotion && gallerySlides.length > 1) {
      galleryTimer = window.setInterval(() => showGallerySlide(galleryIndex + 1), 5000);
    }
  };

  galleryPrev?.addEventListener("click", () => {
    showGallerySlide(galleryIndex - 1);
    startGallery();
  });

  galleryNext?.addEventListener("click", () => {
    showGallerySlide(galleryIndex + 1);
    startGallery();
  });

  gallery.addEventListener("mouseenter", stopGallery);
  gallery.addEventListener("mouseleave", startGallery);
  gallery.addEventListener("focusin", stopGallery);
  gallery.addEventListener("focusout", startGallery);
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") galleryPrev?.click();
    if (event.key === "ArrowRight") galleryNext?.click();
  });

  showGallerySlide(0);
  startGallery();
};

void initializeGallery();

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
