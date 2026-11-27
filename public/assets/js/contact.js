/* Weike Peptides — contact / procurement brief composer */
(function () {
  "use strict";
  var form = document.getElementById("quoteForm");
  if (!form) return;

  var params = new URLSearchParams(window.location.search);
  var product = params.get("product");
  if (product) {
    var select = document.getElementById("productInterest");
    if (select) {
      Array.prototype.slice.call(select.options).forEach(function (opt) {
        if (opt.value === product) select.value = product;
      });
    }
    var message = document.getElementById("message");
    if (message && !message.value) {
      message.value = "Please quote the material referenced on the page I was viewing.";
    }
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function selectedText(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    if (el.options && el.selectedIndex >= 0) return el.options[el.selectedIndex].text;
    return el.value.trim();
  }

  function buildMessage() {
    return "Hello Weike Peptides,\n\n" +
      "I would like to request a quotation.\n\n" +
      "Name: " + value("contactName") + "\n" +
      "Company / institution: " + value("companyName") + "\n" +
      "Email: " + value("contactEmail") + "\n" +
      "WhatsApp / phone: " + value("contactPhone") + "\n" +
      "Destination country: " + value("destination") + "\n" +
      "Material interest: " + selectedText("productInterest") + "\n" +
      "Pack schedule / quantity: " + value("quantity") + "\n" +
      "Documentation needed: " + selectedText("documentation") + "\n\n" +
      "Message:\n" + value("message") + "\n\n" +
      "Please confirm availability, lot file (CoA), lead time and freight. " +
      "I confirm this request is for laboratory research use only.\n\n" +
      "Source page: " + window.location.href;
  }

  function update() {
    var msg = buildMessage();
    var copy = document.getElementById("quoteCopy");
    if (copy) copy.setAttribute("data-copy", msg);
    var wa = document.getElementById("quoteWhatsApp");
    if (wa) wa.setAttribute("href", "https://wa.me/8615866781826?text=" + encodeURIComponent(msg));
  }

  ["contactName", "companyName", "contactEmail", "contactPhone", "destination", "productInterest", "quantity", "documentation", "message"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var msg = buildMessage();
    var status = document.getElementById("formStatus");
    if (status) {
      status.textContent = "Opening your email app with the procurement brief. If nothing opens, use the WhatsApp or copy button.";
      status.classList.add("is-visible");
    }
    window.location.href = "mailto:info@weike.com?subject=" +
      encodeURIComponent("Procurement brief — " + (value("companyName") || value("contactName"))) +
      "&body=" + encodeURIComponent(msg);
  });

  var wa = document.getElementById("quoteWhatsApp");
  if (wa) {
    wa.addEventListener("click", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }
      var status = document.getElementById("formStatus");
      if (status) {
        status.textContent = "WhatsApp is opening with your procurement brief. Review the message before sending.";
        status.classList.add("is-visible");
      }
    });
  }

  update();
})();
