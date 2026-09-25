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

  document.querySelectorAll('[aria-disabled="true"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
