/* Weike Peptides — shared interface behaviour */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var toastTimer = null;

  function qs(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function norm(value) { return String(value || "").toLowerCase().trim(); }

  function toast(message) {
    var el = doc.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove("is-visible"); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = doc.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      doc.body.appendChild(area);
      area.select();
      try {
        var ok = doc.execCommand("copy");
        doc.body.removeChild(area);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (err) {
        doc.body.removeChild(area);
        reject(err);
      }
    });
  }

  /* Header shadow and mobile quick-action dock */
  var header = doc.getElementById("siteHeader");
  var mobileDock = doc.querySelector(".mobile-dock");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (mobileDock) mobileDock.classList.toggle("is-visible", window.scrollY > 620);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  var menuBtn = doc.getElementById("menuToggle");
  var mobileNav = doc.getElementById("mobileNav");
  function setMenu(open) {
    if (!menuBtn || !mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    doc.body.classList.toggle("nav-open", open);
  }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      setMenu(!mobileNav.classList.contains("is-open"));
    });
    qsa("a", mobileNav).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  /* Search dialog */
  var dialog = doc.getElementById("searchDialog");
  var searchInput = doc.getElementById("globalSearchInput");
  var searchResults = doc.getElementById("globalSearchResults");
  var catalog = (window.WEIKE_CATALOG && window.WEIKE_CATALOG.products) || [];

  function searchMatches(query) {
    var q = norm(query);
    if (!q) {
      return catalog.filter(function (p) {
        return p.id === "bpc-157" || p.id === "tb500" || p.id === "tirzepatide" ||
          p.id === "retatrutide" || p.id === "ghk-cu" || p.id === "bacteriostatic-water";
      });
    }
    var scored = [];
    catalog.forEach(function (p) {
      var name = norm(p.name + " " + p.short);
      var aliases = norm((p.aliases || []).join(" "));
      var cas = norm((p.cas || "") + " " + (p.formula || ""));
      var context = norm(p.catName + " " + p.target + " " + p.tag);
      var score = 0;
      if (name === q) score += 100;
      if (name.indexOf(q) === 0) score += 60;
      if (name.indexOf(q) !== -1) score += 35;
      if (aliases.indexOf(q) !== -1) score += 28;
      if (cas.indexOf(q) !== -1) score += 25;
      if (context.indexOf(q) !== -1) score += 12;
      if (score) scored.push({ p: p, score: score });
    });
    scored.sort(function (a, b) {
      return b.score - a.score || a.p.name.localeCompare(b.p.name);
    });
    return scored.slice(0, 10).map(function (x) { return x.p; });
  }

  function renderSearch(query) {
    if (!searchResults) return;
    var results = searchMatches(query);
    if (!results.length) {
      searchResults.innerHTML = '<div class="search-empty"><strong>No matching entry.</strong><br>Try a product name, CAS number, alias or research area.<br><a class="text-link" href="/peptides/">Browse the full encyclopedia →</a></div>';
      return;
    }
    searchResults.innerHTML = results.map(function (p) {
      var meta = p.cas ? "CAS " + esc(p.cas) : "Identity on CoA";
      return '<a class="search-result" href="' + esc(p.slug) + '" data-search-hit>' +
        '<span class="search-result__main"><strong>' + esc(p.name) + '</strong>' +
        '<span>' + esc(p.catName) + ' · ' + meta + '</span></span>' +
        '<span class="search-result__meta">from ' + esc(p.priceFromDisplay) + '</span></a>';
    }).join("");
    qsa("[data-search-hit]", searchResults).forEach(function (link) {
      link.addEventListener("click", function () { closeSearch(); });
    });
  }

  function openSearch() {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    doc.body.classList.add("modal-open");
    renderSearch("");
    window.setTimeout(function () { if (searchInput) searchInput.focus(); }, 30);
  }
  function closeSearch() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    doc.body.classList.remove("modal-open");
  }
  if (dialog) {
    qsa("[data-search-open]").forEach(function (btn) {
      btn.addEventListener("click", openSearch);
    });
    var closeBtn = qs("[data-search-close]", dialog);
    if (closeBtn) closeBtn.addEventListener("click", closeSearch);
    if (searchInput) {
      searchInput.addEventListener("input", function () { renderSearch(searchInput.value); });
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          var q = searchInput.value.trim();
          window.location.href = "/peptides/" + (q ? "?q=" + encodeURIComponent(q) : "");
        }
      });
    }
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeSearch();
    });
    dialog.addEventListener("close", function () {
      doc.body.classList.remove("modal-open");
    });
  }
  doc.addEventListener("keydown", function (event) {
    var tag = (event.target && event.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || tag === "select" || event.target.isContentEditable;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      openSearch();
    } else if (event.key === "Escape") {
      setMenu(false);
    }
  });

  /* Catalogue filters */
  var catalogPage = doc.querySelector("[data-catalog-page]");
  if (catalogPage) {
    var cards = qsa(".catalog-card", catalogPage);
    var groups = qsa(".catalog-group", catalogPage);
    var input = doc.getElementById("catalogSearch");
    var targetSelect = doc.getElementById("targetFilter");
    var countEl = doc.getElementById("catalogCount");
    var emptyEl = doc.getElementById("catalogEmpty");
    var chips = qsa("[data-filter-cat]", catalogPage);
    var reset = doc.querySelector("[data-filter-reset]");
    var state = { q: "", cat: "", target: "" };
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) state.q = params.get("q");
    if (params.get("cat")) state.cat = params.get("cat");
    if (params.get("target")) state.target = params.get("target");
    if (input) input.value = state.q;

    function updateUrl() {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.cat) p.set("cat", state.cat);
      if (state.target) p.set("target", state.target);
      var next = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
      window.history.replaceState({}, "", next);
    }

    function applyFilters() {
      var q = norm(state.q);
      var visible = 0;
      chips.forEach(function (chip) {
        chip.setAttribute("aria-pressed", chip.getAttribute("data-filter-cat") === state.cat ? "true" : "false");
      });
      if (targetSelect) targetSelect.value = state.target;
      cards.forEach(function (card) {
        var matchesQuery = !q || norm(card.getAttribute("data-search")).indexOf(q) !== -1;
        var matchesCat = !state.cat || card.getAttribute("data-cat") === state.cat;
        var matchesTarget = !state.target || (" " + card.getAttribute("data-target") + " ").indexOf(" " + state.target + " ") !== -1;
        var show = matchesQuery && matchesCat && matchesTarget;
        card.hidden = !show;
        if (show) visible += 1;
      });
      groups.forEach(function (group) {
        var any = qsa(".catalog-card", group).some(function (c) { return !c.hidden; });
        group.hidden = !any;
      });
      if (countEl) countEl.textContent = "Showing " + visible + " of " + cards.length + " reference entries";
      if (emptyEl) emptyEl.hidden = visible !== 0;
      updateUrl();
    }

    var timer;
    if (input) {
      input.addEventListener("input", function () {
        state.q = input.value;
        window.clearTimeout(timer);
        timer = window.setTimeout(applyFilters, 120);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-cat");
        state.cat = state.cat === value ? "" : value;
        applyFilters();
        catalogPage.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    if (targetSelect) {
      targetSelect.addEventListener("change", function () {
        state.target = targetSelect.value;
        applyFilters();
      });
    }
    if (reset) {
      reset.addEventListener("click", function (event) {
        event.preventDefault();
        state = { q: "", cat: "", target: "" };
        if (input) input.value = "";
        applyFilters();
      });
    }
    applyFilters();
  }

  /* Copy-to-clipboard links/buttons */
  doc.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy]");
    if (!button) return;
    event.preventDefault();
    var text = button.getAttribute("data-copy") || "";
    if (!text && button.getAttribute("data-copy-target")) {
      var source = qs(button.getAttribute("data-copy-target"));
      text = source ? (source.textContent || "") : "";
    }
    if (!text) return;
    copyText(text).then(function () {
      toast(button.getAttribute("data-copy-msg") || "Copied to clipboard.");
    }).catch(function () {
      toast("Copy failed. Select the text and copy manually.");
    });
  });

  /* Dynamic WhatsApp links on any page (tools can update data-wa-global). */
  window.WeikeUI = {
    toast: toast,
    copyText: copyText,
    esc: esc,
    wa: function (message) {
      return "https://wa.me/8615866781826?text=" + encodeURIComponent(message);
    },
    setGlobalWa: function (message) {
      qsa("[data-wa-global]").forEach(function (link) {
        link.setAttribute("href", window.WeikeUI.wa(message));
      });
    }
  };
})();
