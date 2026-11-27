/* Weike Peptides — reconstitution calculator (pure client-side arithmetic) */
(function () {
  "use strict";

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function num(value) {
    var n = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function fmt(value, decimals) {
    if (!Number.isFinite(value)) return "—";
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function concise(value, max) {
    if (!Number.isFinite(value)) return "—";
    if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (value >= 100) return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
    if (value >= 10) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
    if (value >= 0.01) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return Number(value).toPrecision(3).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  function calculate(mass, diluent, amountMcg) {
    var concentration = mass / diluent;
    var volume = amountMcg / (concentration * 1000);
    var units = volume * 100;
    var per01 = concentration * 100;
    var aliquots = Math.floor((mass * 1000) / amountMcg);
    return {
      concentration: concentration,
      concentrationMcg: concentration * 1000,
      per01: per01,
      volume: volume,
      units: units,
      aliquots: aliquots
    };
  }

  function shareUrl(values) {
    var url = new URL(window.location.href);
    ["mass", "diluent", "amount", "unit"].forEach(function (key) {
      url.searchParams.set(key, values[key]);
    });
    return url.toString();
  }

  function buildMessage(values, result) {
    var amountLabel = values.amount + " " + values.unit;
    var volumeLabel = result.volume < 0.001
      ? concise(result.volume * 1000) + " µL"
      : concise(result.volume) + " mL";
    var unitLabel = result.units > 100 ? "over 100 U (split measurement)" : concise(result.units) + " U on a U-100 scale";
    return "Hello Weike Peptides,\n\n" +
      "I used the reconstitution calculator:\n" +
      "Vial mass: " + values.mass + " mg\n" +
      "Diluent volume: " + values.diluent + " mL\n" +
      "Concentration: " + concise(result.concentration) + " mg/mL (" + concise(result.concentrationMcg) + " mcg/mL)\n" +
      "Target amount per aliquot: " + amountLabel + "\n" +
      "Amount in 0.1 mL: " + concise(result.per01) + " mcg\n" +
      "Volume per aliquot: " + volumeLabel + "\n" +
      "Syringe scale: " + unitLabel + "\n" +
      "Approximate aliquots per vial: " + result.aliquots + "\n\n" +
      "Please confirm pack formats, lot-specific COA, lead time and freight. This is a laboratory calculation only, not a dosing instruction.\n\n" +
      "Calculation: " + shareUrl(values);
  }

  function setActions(values, result) {
    if (!result) return;
    var message = buildMessage(values, result);
    var wa = document.getElementById("calcWa");
    var mail = document.getElementById("calcMail");
    var copy = document.getElementById("calcCopy");
    if (wa) wa.setAttribute("href", "https://wa.me/8615866781826?text=" + encodeURIComponent(message));
    if (mail) {
      mail.setAttribute("href", "mailto:info@weike.com?subject=" +
        encodeURIComponent("Reconstitution calculation") + "&body=" + encodeURIComponent(message));
    }
    if (copy) copy.setAttribute("data-copy", message);
    if (wa) wa.removeAttribute("disabled");
    if (mail) mail.removeAttribute("disabled");
    if (copy) copy.removeAttribute("disabled");
    if (window.WeikeUI) window.WeikeUI.setGlobalWa(message);
  }

  function disableActions() {
    ["calcWa", "calcMail", "calcCopy"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute("disabled", "disabled");
    });
  }

  function readValues(root) {
    var massEl = qs("[data-calc='mass']", root);
    var diluentEl = qs("[data-calc='diluent']", root);
    var amountEl = qs("[data-calc='amount']", root);
    var unitEl = qs("[data-calc='unit']", root);
    var unit = unitEl ? unitEl.value : "mcg";
    var amount = num(amountEl && amountEl.value);
    var mass = num(massEl && massEl.value);
    var diluent = num(diluentEl && diluentEl.value);
    if (amount && unit === "mg") amount *= 1000;
    return {
      mass: mass,
      diluent: diluent,
      amount: amount,
      amountRaw: num(amountEl && amountEl.value),
      unit: unit,
      values: {
        mass: massEl ? massEl.value : "",
        diluent: diluentEl ? diluentEl.value : "",
        amount: amountEl ? amountEl.value : "",
        unit: unit
      }
    };
  }

  function initFull(root) {
    var output = {
      conc: qs("[data-out='conc']", root),
      concMcg: qs("[data-out='conc-mcg']", root),
      per01: qs("[data-out='per01']", root),
      vol: qs("[data-out='vol']", root),
      units: qs("[data-out='units']", root),
      aliquots: qs("[data-out='aliquots']", root),
      note: qs("[data-out='unit-note']", root),
      fill: qs("[data-out='fill']", root),
      unitsLabel: qs("[data-out='units-label']", root)
    };

    var params = new URLSearchParams(window.location.search);
    if (params.get("mass")) qs("[data-calc='mass']", root).value = params.get("mass");
    if (params.get("diluent")) qs("[data-calc='diluent']", root).value = params.get("diluent");
    if (params.get("amount")) qs("[data-calc='amount']", root).value = params.get("amount");
    if (params.get("unit") && qs("[data-calc='unit']", root)) qs("[data-calc='unit']", root).value = params.get("unit");

    function update() {
      var data = readValues(root);
      if (!data.mass || !data.diluent || !data.amount) {
        if (output.conc) output.conc.textContent = "—";
        if (output.concMcg) output.concMcg.textContent = "—";
        if (output.per01) output.per01.textContent = "—";
        if (output.vol) output.vol.textContent = "—";
        if (output.units) output.units.textContent = "—";
        if (output.aliquots) output.aliquots.textContent = "—";
        if (output.fill) output.fill.style.width = "0%";
        if (output.note) output.note.textContent = "Enter valid positive values to calculate.";
        disableActions();
        return;
      }
      var result = calculate(data.mass, data.diluent, data.amount);
      if (output.conc) output.conc.textContent = concise(result.concentration);
      if (output.concMcg) output.concMcg.textContent = concise(result.concentrationMcg) + " mcg/mL";
      if (output.per01) output.per01.textContent = concise(result.per01) + " mcg";
      if (output.vol) {
        output.vol.textContent = result.volume < 0.001
          ? concise(result.volume * 1000) + " µL"
          : concise(result.volume) + " mL";
      }
      if (output.units) output.units.textContent = result.units > 100 ? ">100 U" : concise(result.units) + " U";
      if (output.aliquots) output.aliquots.textContent = result.aliquots > 0 ? result.aliquots : "<1";
      if (output.fill) output.fill.style.width = Math.min(100, Math.max(0, result.units)) + "%";
      if (output.note) {
        output.note.textContent = result.units > 100
          ? "The calculated volume exceeds 100 U on a U-100 syringe. Use a larger syringe or split the measurement."
          : "U-100 scale assumes 100 units per 1 mL. Verify the syringe graduation before use.";
      }
      if (output.unitsLabel) output.unitsLabel.textContent = result.units > 100 ? ">100 U" : concise(result.units) + " U";
      setActions(data.values, result);
    }

    qsa("[data-calc]", root).forEach(function (el) {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    var reset = qs("[data-calc-reset]", root);
    if (reset) {
      reset.addEventListener("click", function () {
        qs("[data-calc='mass']", root).value = "5";
        qs("[data-calc='diluent']", root).value = "2";
        qs("[data-calc='amount']", root).value = "250";
        if (qs("[data-calc='unit']", root)) qs("[data-calc='unit']", root).value = "mcg";
        update();
      });
    }
    update();
  }

  function initQuick(root) {
    var mass = qs("[data-quick='mass']", root);
    var diluent = qs("[data-quick='diluent']", root);
    var amount = qs("[data-quick='amount']", root);
    var concOut = qs("[data-quick-out='conc']", root);
    var volOut = qs("[data-quick-out='vol']", root);
    var unitsOut = qs("[data-quick-out='units']", root);
    var interacted = false;

    function update() {
      var m = num(mass && mass.value);
      var d = num(diluent && diluent.value);
      var a = num(amount && amount.value);
      if (!m || !d || !a) {
        if (concOut) concOut.textContent = "—";
        if (volOut) volOut.textContent = "—";
        if (unitsOut) unitsOut.textContent = "—";
        return;
      }
      var result = calculate(m, d, a);
      if (concOut) concOut.textContent = concise(result.concentration) + " mg/mL";
      if (volOut) {
        volOut.textContent = result.volume < 0.001
          ? concise(result.volume * 1000) + " µL"
          : concise(result.volume) + " mL";
      }
      if (unitsOut) unitsOut.textContent = result.units > 100 ? ">100 U" : concise(result.units) + " U";
      if (interacted && window.WeikeUI) {
        window.WeikeUI.setGlobalWa(buildMessage({
          mass: mass.value, diluent: diluent.value, amount: amount.value, unit: "mcg"
        }, result));
      }
    }
    [mass, diluent, amount].forEach(function (el) {
      if (el) el.addEventListener("input", function () { interacted = true; update(); });
    });
    update();
  }

  var full = document.querySelector("[data-calculator]");
  if (full) initFull(full);
  qsa("[data-quick-calc]").forEach(initQuick);
})();
