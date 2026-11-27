/* Weike Peptides — interactive comparator */
(function () {
  "use strict";

  var root = document.querySelector("[data-compare]");
  if (!root) return;

  var catalog = (window.WEIKE_CATALOG && window.WEIKE_CATALOG.products) || [];
  var byId = {};
  catalog.forEach(function (p) { byId[p.id] = p; });

  var selects = Array.prototype.slice.call(root.querySelectorAll("[data-compare-select]"));
  var tableWrap = document.getElementById("compareTableWrap");
  var summary = document.getElementById("compareSummary");
  var countEl = document.getElementById("compareCount");
  var waBtn = document.getElementById("compareWa");
  var mailBtn = document.getElementById("compareMail");
  var copyBtn = document.getElementById("compareCopy");
  var shareBtn = document.getElementById("compareShare");
  var printBtn = document.getElementById("printCompare");
  var emptyEl = document.getElementById("compareEmpty");
  var state = { ids: [] };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function short(text, max) {
    text = String(text || "");
    if (text.length <= max) return text;
    return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
  }

  function selectedProducts() {
    return state.ids.map(function (id) { return byId[id]; }).filter(Boolean);
  }

  function formatSpecs(p) {
    var labels = p.specs.map(function (s) { return s.label; });
    if (labels.length <= 4) return labels.join(" · ");
    return labels.slice(0, 3).join(" · ") + " · +" + (labels.length - 3) + " more";
  }

  function priceLine(p) {
    if (p.priceFrom === p.priceTo) return money(p.priceFrom) + " / pack";
    return money(p.priceFrom) + "–" + money(p.priceTo) + " / pack";
  }

  function setUrl() {
    var p = new URLSearchParams(window.location.search);
    if (state.ids.length) p.set("ids", state.ids.join(","));
    else p.delete("ids");
    var next = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
    window.history.replaceState({}, "", next);
  }

  function syncSelects() {
    selects.forEach(function (select, index) {
      select.value = state.ids[index] || "";
      var card = select.closest(".select-card");
      if (card) card.classList.toggle("has-value", Boolean(select.value));
    });
  }

  function buildRows(products) {
    var rows = [
      {
        label: "Research category",
        render: function (p) { return esc(p.catName); }
      },
      {
        label: "Identity",
        render: function (p) {
          return "CAS: " + esc(p.cas || "Not published") +
            "<br>Formula: " + esc(p.formula || "See CoA") +
            "<br>MW: " + esc(p.mwDisplay || "See CoA");
        }
      },
      {
        label: "Structure",
        render: function (p) { return esc(short(p.structure, 260)); }
      },
      {
        label: "Primary research target",
        render: function (p) { return esc(p.target); }
      },
      {
        label: "Half-life / exposure",
        render: function (p) { return esc(p.half); }
      },
      {
        label: "Evidence level",
        render: function (p) { return '<span class="badge badge--brand">' + esc(p.evidenceLabel) + '</span>'; }
      },
      {
        label: "Catalog formats",
        render: function (p) { return esc(formatSpecs(p)); }
      },
      {
        label: "List price from",
        render: function (p) { return '<span class="price">' + esc(priceLine(p)) + '</span>'; }
      },
      {
        label: "Storage",
        render: function (p) {
          var s = String(p.storage || "");
          var first = s.split(". ")[0];
          return esc(short(first, 150));
        }
      },
      {
        label: "Reference",
        render: function (p) {
          return '<a class="text-link" href="' + esc(p.slug) + '">Full entry ' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></a>';
        }
      }
    ];
    return rows;
  }

  function renderTable(products) {
    if (!tableWrap) return;
    if (!products.length) {
      tableWrap.innerHTML = '<div class="empty-state" id="compareEmpty"><div><h3>Start a comparison</h3><p>Choose at least one peptide above. Add a second to see identity, structure, formats and pricing side by side.</p></div></div>';
      return;
    }
    var rows = buildRows(products);
    var head = '<thead><tr><th scope="col">Parameter</th>' + products.map(function (p) {
      return '<th scope="col"><div class="compare-product"><a href="' + esc(p.slug) + '">' + esc(p.name) + '</a>' +
        '<span>' + esc(p.catName) + '</span><span class="badge">' + esc(p.evidenceLabel) + '</span></div></th>';
    }).join("") + '</tr></thead>';
    var body = '<tbody>' + rows.map(function (row) {
      return '<tr><th scope="row">' + esc(row.label) + '</th>' + products.map(function (p) {
        return '<td>' + row.render(p) + '</td>';
      }).join("") + '</tr>';
    }).join("") + '</tbody>';
    tableWrap.innerHTML = '<div class="table-scroll-hint">Swipe horizontally to see all columns ' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></div>' +
      '<div class="compare-matrix-wrap"><table class="compare-matrix">' + head + body + '</table></div>' +
      '<div class="compare-legend"><span><i class="key"></i> Identity values are shown where a public record exists</span><span>Confirm lot-specific values on the CoA</span><span>On mobile, swipe the matrix sideways.</span></div>';
  }

  function buildMessage(products) {
    var link = "https://weike.com/compare.html?ids=" + state.ids.join(",");
    var lines = products.map(function (p, i) {
      return (i + 1) + ". " + p.name + " — " + (p.cas ? "CAS " + p.cas : "CAS not published") +
        " — " + priceLine(p);
    });
    return "Hello Weike Peptides,\n\nI am comparing these research peptides:\n" +
      lines.join("\n") +
      "\n\nPlease confirm pack formats, lot-specific COA, lead time and freight to my destination. " +
      "This request is for laboratory research use only.\n\nComparison: " + link;
  }

  function buildSummary(products) {
    if (!summary) return;
    if (!products.length) {
      summary.innerHTML = '<h3>No entries selected</h3><p>Use the selectors above to build a comparison. The shortlist stays in the URL, so you can bookmark or share it.</p>';
      return;
    }
    var cats = {};
    products.forEach(function (p) { cats[p.catName] = true; });
    var prices = products.map(function (p) { return p.priceFrom; });
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);
    var missing = products.filter(function (p) { return !p.cas; }).length;
    var sameCat = Object.keys(cats).length === 1;
    var text = "<h3>" + products.length + " " + (products.length === 1 ? "entry" : "entries") + " selected</h3>" +
      "<p>" + (sameCat ? "All selected entries sit within " + esc(products[0].catName) + "." : "The selection spans " + Object.keys(cats).length + " research categories.") +
      " List prices range from <strong>" + money(min) + "</strong> to <strong>" + money(max) + "</strong> per pack. " +
      (missing ? missing + " entr" + (missing === 1 ? "y has" : "ies have") + " no public CAS in the source catalog; request the lot CoA before relying on identity." : "Public CAS identifiers are available for all selected entries; the lot CoA still governs.") +
      " This is a reference comparison, not an equivalence claim.</p>";
    summary.innerHTML = text;
  }

  function updateActions(products) {
    var message = buildMessage(products);
    if (waBtn) waBtn.setAttribute("href", "https://wa.me/8615866781826?text=" + encodeURIComponent(message));
    if (mailBtn) {
      mailBtn.setAttribute("href", "mailto:info@weike.com?subject=" + encodeURIComponent("Peptide comparison request") + "&body=" + encodeURIComponent(message));
    }
    if (window.WeikeUI) window.WeikeUI.setGlobalWa(message);
    var link = "https://weike.com/compare.html?ids=" + state.ids.join(",");
    if (shareBtn) shareBtn.setAttribute("data-copy", link);
    if (copyBtn) copyBtn.setAttribute("data-copy", message);
  }

  function render() {
    var products = selectedProducts();
    syncSelects();
    renderTable(products);
    buildSummary(products);
    updateActions(products);
    if (countEl) countEl.textContent = products.length + " of 4 selected";
    setUrl();
    var hasTwo = products.length >= 2;
    if (waBtn) waBtn.toggleAttribute("disabled", !products.length);
    if (mailBtn) mailBtn.toggleAttribute("disabled", !products.length);
    if (copyBtn) copyBtn.toggleAttribute("disabled", !products.length);
    if (shareBtn) shareBtn.toggleAttribute("disabled", !hasTwo);
    if (printBtn) printBtn.toggleAttribute("disabled", !products.length);
  }

  function fromQuery() {
    var params = new URLSearchParams(window.location.search);
    var ids = (params.get("ids") || "").split(",").filter(function (id) { return Boolean(byId[id]); });
    ids = ids.filter(function (id, index) { return ids.indexOf(id) === index; }).slice(0, 4);
    if (ids.length) return ids;
    var defaults = (root.getAttribute("data-default") || "").split(",").filter(function (id) { return Boolean(byId[id]); });
    return defaults.slice(0, 4);
  }

  state.ids = fromQuery();

  selects.forEach(function (select, index) {
    select.addEventListener("change", function () {
      var value = select.value;
      if (value && state.ids.indexOf(value) !== -1 && state.ids[index] !== value) {
        if (window.WeikeUI) window.WeikeUI.toast("That peptide is already in the comparison.");
        select.value = "";
        return;
      }
      var next = selects.map(function (s) { return s.value; }).filter(Boolean);
      state.ids = next.filter(function (id, i) { return next.indexOf(id) === i; }).slice(0, 4);
      render();
    });
  });

  Array.prototype.slice.call(root.querySelectorAll("[data-clear-slot]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var index = parseInt(btn.getAttribute("data-clear-slot"), 10) - 1;
      if (selects[index]) selects[index].value = "";
      var next = selects.map(function (s) { return s.value; }).filter(Boolean);
      state.ids = next.filter(function (id, i) { return next.indexOf(id) === i; }).slice(0, 4);
      render();
    });
  });

  Array.prototype.slice.call(root.querySelectorAll("[data-preset]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ids = (btn.getAttribute("data-preset") || "").split(",").filter(function (id) { return Boolean(byId[id]); }).slice(0, 4);
      if (!ids.length) return;
      state.ids = ids;
      selects.forEach(function (s, i) { s.value = ids[i] || ""; });
      render();
      var target = document.getElementById("comparator");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  Array.prototype.slice.call(root.querySelectorAll("[data-clear-compare]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.ids = [];
      selects.forEach(function (s) { s.value = ""; });
      render();
    });
  });

  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var link = window.location.href;
      (window.WeikeUI ? window.WeikeUI.copyText(link) : Promise.reject()).then(function () {
        if (window.WeikeUI) window.WeikeUI.toast("Comparison link copied.");
      }).catch(function () {
        if (window.WeikeUI) window.WeikeUI.toast("Copy the address bar to share this comparison.");
      });
    });
  }

  render();
})();
