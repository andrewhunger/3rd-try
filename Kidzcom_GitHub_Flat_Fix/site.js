(() => {
  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);

  const staff = Array.isArray(window.KIDZ_STAFF) ? window.KIDZ_STAFF : [];

  document.querySelectorAll("[data-staff-list]").forEach((container) => {
    const people = container.dataset.staffFeatured === "true"
      ? staff.filter((person) => person.featured)
      : staff;

    container.innerHTML = people.map((person) => {
      const name = escapeHtml(person.name);
      const role = escapeHtml(person.role);
      const bio = escapeHtml(person.bio);
      const photo = escapeHtml(person.photo);
      const alterEgo = person.alterEgo ? escapeHtml(person.alterEgo) : "";
      const alterPhoto = person.alterPhoto ? escapeHtml(person.alterPhoto) : "";
      const photoMarkup = alterPhoto
        ? `<button class="staff-photo-button" type="button" data-staff-photo data-staff-name="${name}" aria-pressed="false" aria-label="Show ${name}'s alter ego photo">
            <span class="staff-photo-inner">
              <span class="staff-photo-face"><img src="${photo}" alt="${name} at Kidz.com" /></span>
              <span class="staff-photo-face staff-photo-alter"><img src="${alterPhoto}" alt="${name}'s ${alterEgo} alter ego" /></span>
            </span>
            <span class="flip-hint">photo flips</span>
          </button>`
        : `<div class="staff-photo-static"><img src="${photo}" alt="${name} at Kidz.com" /></div>`;
      const alterEgoMarkup = alterEgo ? `<p class="alter-ego">Alter ego: ${alterEgo}</p>` : "";

      return `
        <article class="staff-card">
          ${photoMarkup}
          <div class="staff-copy">
            <h3>${name}</h3>
            <p class="staff-role">${role}</p>
            <p>${bio}</p>
            ${alterEgoMarkup}
          </div>
        </article>`;
    }).join("");
  });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-site-nav]");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const open = navigation.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staffPhotos = [...document.querySelectorAll("[data-staff-photo]")];

  const setFlip = (button, flipped) => {
    button.classList.toggle("is-flipped", flipped);
    button.setAttribute("aria-pressed", String(flipped));
    const name = button.dataset.staffName || "staff member";
    button.setAttribute(
      "aria-label",
      flipped ? `Show ${name}'s staff photo` : `Show ${name}'s alter ego photo`
    );
  };

  staffPhotos.forEach((button, index) => {
    let paused = false;
    let normalTimer;
    let alterTimer;

    const clearTimers = () => {
      window.clearTimeout(normalTimer);
      window.clearTimeout(alterTimer);
    };

    const schedule = (delay = 10000 + index * 950) => {
      if (reduceMotion) return;
      clearTimers();
      normalTimer = window.setTimeout(() => {
        if (paused) {
          schedule(1800);
          return;
        }
        setFlip(button, true);
        alterTimer = window.setTimeout(() => {
          if (!paused) setFlip(button, false);
          schedule(10000);
        }, 3000);
      }, delay);
    };

    button.addEventListener("mouseenter", () => {
      paused = true;
      clearTimers();
      setFlip(button, true);
    });

    button.addEventListener("mouseleave", () => {
      paused = false;
      setFlip(button, false);
      schedule(10000);
    });

    button.addEventListener("focus", () => {
      paused = true;
      clearTimers();
    });

    button.addEventListener("blur", () => {
      paused = false;
      setFlip(button, false);
      schedule(10000);
    });

    button.addEventListener("click", () => {
      paused = true;
      clearTimers();
      const next = !button.classList.contains("is-flipped");
      setFlip(button, next);
      window.setTimeout(() => {
        paused = false;
        setFlip(button, false);
        schedule(10000);
      }, 5000);
    });

    schedule();
  });

  document.querySelectorAll("[data-programme-carousel]").forEach((carousel) => {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    const status = carousel.querySelector("[data-carousel-status]");
    let currentIndex = 0;
    let scrollFrame;

    if (!viewport || !slides.length || !previousButton || !nextButton || !dotsContainer) return;

    slides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show ${slide.dataset.slideTitle || `programme ${index + 1}`}`);
      dot.addEventListener("click", () => goTo(index));
      dotsContainer.appendChild(dot);
    });

    const dots = [...dotsContainer.querySelectorAll("button")];
    const slidePosition = (slide) => slide.offsetLeft - slides[0].offsetLeft;

    const updateControls = () => {
      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === slides.length - 1;
      dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === currentIndex)));
      if (status) {
        const title = slides[currentIndex].dataset.slideTitle || `Programme ${currentIndex + 1}`;
        status.textContent = `${currentIndex + 1} of ${slides.length}: ${title}`;
      }
    };

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      viewport.scrollTo({
        left: slidePosition(slides[currentIndex]),
        behavior: reduceMotion ? "auto" : "smooth"
      });
      updateControls();
    }

    previousButton.addEventListener("click", () => goTo(currentIndex - 1));
    nextButton.addEventListener("click", () => goTo(currentIndex + 1));

    viewport.addEventListener("scroll", () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const closest = slides.reduce((best, slide, index) => (
          Math.abs(slidePosition(slide) - viewport.scrollLeft) < Math.abs(slidePosition(slides[best]) - viewport.scrollLeft)
            ? index
            : best
        ), 0);
        if (closest !== currentIndex) {
          currentIndex = closest;
          updateControls();
        }
      });
    }, { passive: true });

    updateControls();
  });

  const posterDialog = document.querySelector("[data-poster-dialog]");
  const posterDialogImage = posterDialog?.querySelector("[data-poster-dialog-image]");
  const posterDialogTitle = posterDialog?.querySelector("[data-poster-dialog-title]");
  const posterDialogClose = posterDialog?.querySelector("[data-poster-dialog-close]");

  document.querySelectorAll("[data-poster-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.dataset.posterSrc;
      const title = button.dataset.posterTitle || "Programme poster";
      if (!source) return;

      if (!posterDialog || !posterDialogImage || !posterDialogTitle || typeof posterDialog.showModal !== "function") {
        window.open(source, "_blank", "noopener");
        return;
      }

      posterDialogImage.src = source;
      posterDialogImage.alt = `${title} programme poster`;
      posterDialogTitle.textContent = title;
      posterDialog.showModal();
    });
  });

  posterDialogClose?.addEventListener("click", () => posterDialog.close());
  posterDialog?.addEventListener("click", (event) => {
    if (event.target === posterDialog) posterDialog.close();
  });

  document.querySelectorAll('[aria-disabled="true"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
