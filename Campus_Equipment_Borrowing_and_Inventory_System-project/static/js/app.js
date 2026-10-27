/* Campus Equipment System — progressive enhancement only.
   Every page still works with JavaScript off, except that irreversible
   actions lose their confirmation step. No external libraries. */
(function () {
    "use strict";

    /* 1. Off-canvas admin sidebar on small screens ----------------------- */
    var toggle = document.querySelector(".nav-toggle");
    var scrim = document.querySelector(".sidebar-scrim");
    function setSidebar(open) {
        document.body.classList.toggle("sidebar-open", open);
        if (toggle) {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        }
        if (scrim) { scrim.hidden = !open; }
    }
    if (toggle) {
        toggle.addEventListener("click", function () {
            setSidebar(!document.body.classList.contains("sidebar-open"));
        });
    }
    if (scrim) { scrim.addEventListener("click", function () { setSidebar(false); }); }
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
            setSidebar(false);
            if (toggle) { toggle.focus(); }
        }
    });

    /* 2. Confirmation dialog for irreversible workflow actions -------------
       Usage: <button type="submit" data-confirm="Reject this request?"> or
              <form data-confirm="...">. Uses a native <dialog>, with
              window.confirm() as the fallback for very old browsers. */
    var dialog = null;
    function buildDialog() {
        var d = document.createElement("dialog");
        d.className = "confirm-dialog";
        d.setAttribute("aria-labelledby", "confirm-title");
        d.innerHTML =
            '<form method="dialog">' +
            '<div class="confirm-dialog__body">' +
            '<h2 class="confirm-dialog__title" id="confirm-title">' +
            '<svg class="icon"><use href="#i-alert"/></svg>Please confirm</h2>' +
            '<p class="confirm-dialog__message"></p></div>' +
            '<div class="confirm-dialog__actions">' +
            '<button class="btn btn--outline" value="cancel" autofocus>Cancel</button>' +
            '<button class="btn btn--primary" value="ok">Confirm</button>' +
            "</div></form>";
        document.body.appendChild(d);
        return d;
    }
    document.addEventListener("submit", function (e) {
        var form = e.target;
        var trigger = e.submitter;
        var message = (trigger && trigger.dataset.confirm) || form.dataset.confirm;
        if (!message || form.dataset.confirmed === "1") { return; }
        e.preventDefault();

        if (typeof HTMLDialogElement === "undefined") {
            if (window.confirm(message)) { form.dataset.confirmed = "1"; form.requestSubmit(trigger); }
            return;
        }
        dialog = dialog || buildDialog();
        dialog.querySelector(".confirm-dialog__message").textContent = message;
        dialog.addEventListener("close", function onClose() {
            dialog.removeEventListener("close", onClose);
            if (dialog.returnValue === "ok") {
                form.dataset.confirmed = "1";
                form.requestSubmit(trigger);
            }
            if (trigger) { trigger.focus(); }
        });
        dialog.returnValue = "";
        dialog.showModal();
    });

    /* 3. Live filter for the portal catalog (name / category / text) ------ */
    var search = document.getElementById("catalog-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-card]"));
    if (search && cards.length) {
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-category-chip]"));
        var status = document.getElementById("catalog-status");
        var empty = document.getElementById("catalog-empty");
        var activeCategory = "";

        var apply = function () {
            var q = search.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var match = (!q || card.dataset.search.indexOf(q) !== -1) &&
                            (!activeCategory || card.dataset.category === activeCategory);
                card.hidden = !match;
                if (match) { shown += 1; }
            });
            if (empty) { empty.hidden = shown !== 0; }
            if (status) {
                status.textContent = shown + (shown === 1 ? " item" : " items") + " shown";
            }
        };
        search.addEventListener("input", apply);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeCategory = chip.dataset.categoryChip;
                chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
                apply();
            });
        });
        apply();
    }
})();
