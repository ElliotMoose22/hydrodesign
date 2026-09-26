(function () {
  var nav = document.querySelector("[data-nav]");
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");

  function menuIsCollapsible() {
    return toggle && window.getComputedStyle(toggle).display !== "none";
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    document.body.classList.toggle("nav-open", open && menuIsCollapsible());
    if (open && menuIsCollapsible()) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!nav || !nav.classList.contains("is-open") || !menuIsCollapsible()) return;
    if (e.key === "Escape") {
      setMenu(false);
      if (toggle) toggle.focus();
      return;
    }
    if (e.key !== "Tab") return;
    var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a")));
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (nav && nav.classList.contains("is-open") && !menuIsCollapsible()) {
      setMenu(false);
    }
  });

  var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav] a[href^='#']"));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
    var current = null;
    targets.forEach(function (section) {
      if (window.scrollY + 120 >= section.offsetTop) current = section.id;
    });
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + current;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scrollFrame = 0;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function headerOffset() {
    return header ? Math.round(header.getBoundingClientRect().height) + 8 : 56;
  }

  function closeMenu() {
    if (nav) nav.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menu");
    }
    document.body.classList.remove("nav-open");
  }

  function stopScrollAnim() {
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
  }

  function scrollToSection(el, done) {
    var dest = el.id === "top" ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset());
    var start = window.scrollY;
    var dist = dest - start;

    if (reduceMotion.matches || Math.abs(dist) < 2) {
      window.scrollTo(0, dest);
      if (done) done();
      return;
    }

    stopScrollAnim();
    var duration = Math.min(1250, Math.max(720, Math.abs(dist) * 0.48));
    var t0 = performance.now();

    function frame(now) {
      var t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + dist * easeInOutCubic(t));
      if (t < 1) scrollFrame = requestAnimationFrame(frame);
      else {
        scrollFrame = 0;
        if (done) done();
      }
    }
    scrollFrame = requestAnimationFrame(frame);
  }

  function markArrival(el) {
    el.classList.remove("is-in");
    void el.offsetWidth;
    el.classList.add("is-in");
    var heading = el.querySelector("h1, h2, h3") || el;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  ["wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, stopScrollAnim, { passive: true });
  });

  document.querySelectorAll('a[href^="#"]:not(.skip)').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToSection(target, function () {
        if (history.pushState) history.pushState(null, "", hash);
        else location.hash = hash;
        markArrival(target);
      });
    });
  });

  var typed = document.querySelector("[data-type]");
  if (typed) {
    var full = typed.getAttribute("data-type") || "";
    typed.setAttribute("aria-hidden", "true");
    if (full) {
      var sr = document.createElement("p");
      sr.className = "visually-hidden";
      sr.textContent = full;
      typed.after(sr);
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      typed.textContent = full;
      typed.classList.add("done");
    } else {
      var i = 0;
      typed.textContent = "";
      (function tick() {
        typed.textContent = full.slice(0, i);
        if (i++ < full.length) setTimeout(tick, 45);
        else typed.classList.add("done");
      })();
    }
  }

  document.querySelectorAll("a[aria-label] svg, .hero__down svg").forEach(function (svg) {
    svg.setAttribute("aria-hidden", "true");
  });
  document.querySelectorAll("[data-nav-toggle] span").forEach(function (el) {
    el.setAttribute("aria-hidden", "true");
  });
  document.querySelectorAll(".tier__row > div, .tier__slots > div, .slots > div, .logos > div").forEach(function (el) {
    if (!el.textContent.trim() && !el.querySelector("img")) el.setAttribute("aria-hidden", "true");
  });
})();
