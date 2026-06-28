(function attachDragonBurgerMenu() {
  "use strict";

  if (window.__DRAGON_BURGER_MENU_ATTACHED__) return;
  window.__DRAGON_BURGER_MENU_ATTACHED__ = true;

  const scriptEl = document.currentScript;
  const rootUrl = new URL(".", scriptEl?.src || document.baseURI);
  const pages = [
    { file: "dragon.com.html", label: "Home", note: "landing page" },
    { file: "menu.html", label: "Menu", note: "customer menu" },
    { file: "kassa_dragon.html", label: "Kassa", note: "cashier panel" },
    { file: "monitor_kuhnhya.html", label: "Kitchen", note: "kitchen screen" },
    { file: "monitor_klient.html", label: "Client Monitor", note: "client orders" },
    { file: "admin.html", label: "Admin", note: "orders admin" },
    { file: "market.html", label: "Market", note: "stores" },
    { file: "profil.html", label: "Profile", note: "profile and orders" }
  ];

  function pageUrl(file) {
    return new URL(file, rootUrl).href;
  }

  function pathOf(url) {
    const parsed = new URL(url, window.location.href);
    return parsed.pathname.endsWith("/") ? `${parsed.pathname}index.html` : parsed.pathname;
  }

  function isActive(file) {
    return pathOf(pageUrl(file)) === pathOf(window.location.href);
  }

  function injectStyles() {
    if (document.getElementById("dragonBurgerMenuStyles")) return;

    const style = document.createElement("style");
    style.id = "dragonBurgerMenuStyles";
    style.textContent = `
      .dragon-burger-menu {
        position: fixed;
        top: max(14px, env(safe-area-inset-top));
        right: max(14px, env(safe-area-inset-right));
        z-index: 2147482000;
        font-family: "Segoe UI", "Inter", system-ui, sans-serif;
        color: #fff4f2;
      }
      .dragon-burger-menu * { box-sizing: border-box; }
      .dragon-burger-toggle {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        min-height: 44px;
        padding: 10px 14px;
        border: 1px solid rgba(255, 61, 36, 0.62);
        border-radius: 999px;
        color: #fff7f4;
        background:
          radial-gradient(circle at 16% 12%, rgba(255, 179, 0, 0.34), transparent 28%),
          linear-gradient(135deg, rgba(45, 0, 6, 0.96), rgba(135, 14, 12, 0.9));
        box-shadow:
          0 0 0 1px rgba(255, 129, 66, 0.16) inset,
          0 0 20px rgba(255, 30, 12, 0.42),
          0 18px 50px rgba(0, 0, 0, 0.5);
        cursor: pointer;
        letter-spacing: 0.08em;
        font-weight: 900;
        text-transform: uppercase;
      }
      .dragon-burger-toggle:hover,
      .dragon-burger-toggle:focus-visible {
        outline: none;
        border-color: rgba(255, 180, 0, 0.86);
        box-shadow:
          0 0 0 1px rgba(255, 180, 0, 0.26) inset,
          0 0 26px rgba(255, 46, 16, 0.62),
          0 0 42px rgba(255, 180, 0, 0.16);
      }
      .dragon-burger-bars {
        display: grid;
        gap: 4px;
        width: 18px;
      }
      .dragon-burger-bars span {
        display: block;
        height: 2px;
        border-radius: 999px;
        background: currentColor;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.65);
      }
      .dragon-burger-panel {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        width: min(330px, calc(100vw - 28px));
        max-height: min(78vh, 640px);
        overflow: auto;
        padding: 14px;
        border: 1px solid rgba(255, 46, 16, 0.44);
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(35, 0, 6, 0.98), rgba(8, 4, 16, 0.98)),
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 16px);
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.06) inset,
          0 0 44px rgba(255, 26, 10, 0.34),
          0 28px 80px rgba(0, 0, 0, 0.62);
        transform: translateY(-8px) scale(0.98);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.16s ease, transform 0.16s ease;
        backdrop-filter: blur(18px);
      }
      .dragon-burger-menu.is-open .dragon-burger-panel {
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: auto;
      }
      .dragon-burger-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 4px 12px;
      }
      .dragon-burger-title { display: grid; gap: 2px; }
      .dragon-burger-title strong {
        color: #ffffff;
        font-size: 15px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .dragon-burger-title span {
        color: rgba(255, 214, 205, 0.72);
        font-size: 12px;
      }
      .dragon-burger-close {
        width: 36px;
        height: 36px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        color: #fff4f2;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      }
      .dragon-burger-close:hover,
      .dragon-burger-close:focus-visible {
        outline: none;
        border-color: rgba(255, 180, 0, 0.56);
        background: rgba(255, 74, 36, 0.18);
      }
      .dragon-burger-links {
        display: grid;
        gap: 8px;
      }
      .dragon-burger-link {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 4px 12px;
        padding: 12px 13px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 17px;
        color: #fff4f2;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.045);
      }
      .dragon-burger-link:hover,
      .dragon-burger-link:focus-visible,
      .dragon-burger-link.is-active {
        outline: none;
        border-color: rgba(255, 69, 35, 0.72);
        background:
          linear-gradient(135deg, rgba(255, 47, 20, 0.2), rgba(255, 180, 0, 0.09)),
          rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 18px rgba(255, 36, 12, 0.24);
      }
      .dragon-burger-link strong {
        color: #ffffff;
        font-size: 14px;
      }
      .dragon-burger-link span {
        grid-column: 1 / -1;
        color: rgba(255, 211, 203, 0.68);
        font-size: 12px;
      }
      .dragon-burger-link em {
        align-self: center;
        color: #ffb000;
        font-style: normal;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      @media (max-width: 560px) {
        .dragon-burger-menu {
          top: max(10px, env(safe-area-inset-top));
          right: max(10px, env(safe-area-inset-right));
        }
        .dragon-burger-toggle {
          min-height: 40px;
          padding: 9px 12px;
          font-size: 12px;
        }
      }
      @media print {
        .dragon-burger-menu { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function closeMenu(root, toggle) {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function buildFloatingMenu() {
    injectStyles();

    const root = document.createElement("div");
    root.className = "dragon-burger-menu";

    const toggle = document.createElement("button");
    toggle.className = "dragon-burger-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open DRAGON menu");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `
      <span class="dragon-burger-bars" aria-hidden="true"><span></span><span></span><span></span></span>
      <span>Menu</span>
    `;

    const panel = document.createElement("nav");
    panel.className = "dragon-burger-panel";
    panel.setAttribute("aria-label", "DRAGON navigation");
    panel.innerHTML = `
      <div class="dragon-burger-head">
        <div class="dragon-burger-title">
          <strong>DRAGON Menu</strong>
          <span>быстрая навигация</span>
        </div>
        <button class="dragon-burger-close" type="button" aria-label="Close DRAGON menu">×</button>
      </div>
      <div class="dragon-burger-links">
        ${pages.map(page => `
          <a class="dragon-burger-link ${isActive(page.file) ? "is-active" : ""}" href="${pageUrl(page.file)}">
            <strong>${page.label}</strong>
            ${isActive(page.file) ? "<em>open</em>" : ""}
            <span>${page.note}</span>
          </a>
        `).join("")}
      </div>
    `;

    root.append(toggle, panel);
    document.body.appendChild(root);

    const close = panel.querySelector(".dragon-burger-close");
    toggle.addEventListener("click", event => {
      event.stopPropagation();
      const open = root.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    close?.addEventListener("click", () => closeMenu(root, toggle));
    document.addEventListener("click", event => {
      if (!root.contains(event.target)) closeMenu(root, toggle);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu(root, toggle);
    });
  }

  function init() {
    if (document.getElementById("burgerBtn") && isActive("index.html")) {
      return;
    }

    buildFloatingMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
