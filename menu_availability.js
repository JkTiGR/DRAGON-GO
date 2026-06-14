(function () {
  const STORAGE_KEY = "DRAGON_MENU_AVAILABILITY_V1";
  const API_URL = window.DRAGON_STATIC?.menuAvailabilityApi || "";

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function safeParse(value) {
    try {
      const parsed = JSON.parse(value || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function normalizeData(raw = {}) {
    return {
      version: 1,
      updated_at: String(raw.updated_at || ""),
      items: raw.items && typeof raw.items === "object" ? raw.items : {}
    };
  }

  function load() {
    return cleanupExpired(normalizeData(safeParse(localStorage.getItem(STORAGE_KEY))));
  }

  function persistLocal(data, emit = true) {
    const next = normalizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (emit) {
      window.dispatchEvent(new CustomEvent("dragon-menu-availability-changed", { detail: next }));
    }
    return next;
  }

  async function pushRemote(data) {
    if (!API_URL) return { ok: false, error: "api_unavailable" };
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = await response.json();
      if (payload?.availability) persistLocal(payload.availability, false);
      return payload;
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  }

  function save(data, options = {}) {
    const next = normalizeData(data);
    next.updated_at = new Date().toISOString();
    persistLocal(next, true);
    if (options.remote !== false) {
      pushRemote(next);
    }
    return next;
  }

  async function refresh() {
    if (!API_URL) return load();
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) return load();
      const payload = await response.json();
      const remote = payload?.availability || payload;
      const next = cleanupExpired(normalizeData(remote));
      persistLocal(next, true);
      return next;
    } catch (_) {
      return load();
    }
  }

  function itemKey(item) {
    return String(item?.key || item?.id || item?.code || "").trim();
  }

  function itemTitle(item, lang = "ru") {
    return String(item?.translations?.[lang] || item?.translations?.ru || item?.name || item?.code || itemKey(item) || "—");
  }

  function recordFor(itemOrKey, data = load()) {
    const key = typeof itemOrKey === "string" ? itemOrKey : itemKey(itemOrKey);
    return key ? data.items?.[key] || null : null;
  }

  function isDisabled(itemOrKey, date = todayKey(), data = load()) {
    const rec = recordFor(itemOrKey, data);
    if (!rec?.disabled) return false;
    if (!rec.date) return true;
    return rec.date === date;
  }

  function isAvailable(itemOrKey, date = todayKey(), data = load()) {
    return !isDisabled(itemOrKey, date, data);
  }

  function setTodayDisabled(itemOrKey, disabled, reason = "") {
    const key = typeof itemOrKey === "string" ? itemOrKey : itemKey(itemOrKey);
    if (!key) return load();

    const data = load();
    if (disabled) {
      data.items[key] = {
        disabled: true,
        date: todayKey(),
        reason: String(reason || "").trim(),
        updated_at: new Date().toISOString()
      };
    } else {
      delete data.items[key];
    }
    return save(data);
  }

  function setReason(itemOrKey, reason = "") {
    const key = typeof itemOrKey === "string" ? itemOrKey : itemKey(itemOrKey);
    if (!key) return load();

    const data = load();
    const current = data.items[key] || { disabled: false, date: todayKey() };
    data.items[key] = {
      ...current,
      reason: String(reason || "").trim(),
      updated_at: new Date().toISOString()
    };
    return save(data);
  }

  function clearToday() {
    const data = load();
    const today = todayKey();
    Object.entries(data.items || {}).forEach(([key, rec]) => {
      if (!rec?.date || rec.date === today) delete data.items[key];
    });
    return save(data);
  }

  function cleanupExpired(data) {
    const today = todayKey();
    let changed = false;
    Object.entries(data.items || {}).forEach(([key, rec]) => {
      if (rec?.date && rec.date !== today) {
        delete data.items[key];
        changed = true;
      }
    });

    if (changed) {
      data.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  }

  function disabledKeys(data = load(), date = todayKey()) {
    return Object.entries(data.items || {})
      .filter(([, rec]) => rec?.disabled && (!rec.date || rec.date === date))
      .map(([key]) => key);
  }

  window.DRAGON_MENU_AVAILABILITY = {
    STORAGE_KEY,
    API_URL,
    todayKey,
    load,
    save,
    refresh,
    pushRemote,
    itemKey,
    itemTitle,
    recordFor,
    isDisabled,
    isAvailable,
    setTodayDisabled,
    setReason,
    clearToday,
    cleanupExpired,
    disabledKeys
  };
})();
