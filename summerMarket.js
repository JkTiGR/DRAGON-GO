(() => {
  "use strict";

  const SUMMER_TOP_CODES = [
    "BGCX",
    "BsN",
    "BsMix",
    "BsB",
    "BsG",
    "BsT",
    "MXB",
    "MXGCx",
    "MTxT",
    "CRGCx",
    "NEM",
    "BBAO"
  ];

  const CODE_ALIASES = {
    bgcx: "salat_bun_ga_chien_xu"
  };

  const CART_KEY = "CD_CART_V2";
  const MARKET_STATE_KEY = "DRAGON_MARKET_STATE_V1";
  const WATCHLIST_KEY = "DRAGON_MARKET_WATCHLIST_V1";
  const ALERTS_KEY = "DRAGON_MARKET_ALERTS_V1";
  const RESERVATIONS_KEY = "DRAGON_MARKET_RESERVATIONS_V1";
  const CURRENCY = "грн";

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };

  const normalizeCode = value => String(value || "").trim().toLowerCase();
  const marketMenu = menuData => menuData || window.menuData || {};
  const textByLocale = (value, locale = "ru") => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[locale] || value.ru || value.ua || value.vn || "";
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function flattenMenu(menuData) {
    return Object.entries(marketMenu(menuData)).flatMap(([category, items]) => {
      if (!Array.isArray(items)) return [];
      return items.map((item, index) => ({
        ...item,
        category,
        index,
        cartId: `${category}:${index}`,
        menuItem: item
      }));
    });
  }

  function findMenuItemByCode(menuData, code) {
    const normalizedCode = normalizeCode(code);
    const items = flattenMenu(menuData);
    const exact = items.find(item =>
      normalizeCode(item.code) === normalizedCode ||
      normalizeCode(item.key) === normalizedCode
    );
    if (exact) return { ...exact, requestedCode: code };

    const alias = CODE_ALIASES[normalizedCode];
    if (alias) {
      const aliased = items.find(item =>
        normalizeCode(item.code) === normalizeCode(alias) ||
        normalizeCode(item.key) === normalizeCode(alias)
      );
      if (aliased) return { ...aliased, requestedCode: code, alias };
    }

    console.warn(`[DRAGON Market] Summer Top item not found: ${code}`);
    return null;
  }

  function getSummerTopItems(menuData) {
    return SUMMER_TOP_CODES
      .map(code => findMenuItemByCode(menuData, code))
      .filter(Boolean);
  }

  function calculateMarketPrice({
    basePrice,
    kitchenLoad,
    queueOrders,
    avgCookTimeMinutes,
    hour
  }) {
    let price = Number(basePrice) || 0;

    if (kitchenLoad > 70) {
      price += 10;
    }

    if (kitchenLoad > 90) {
      price += 20;
    }

    if (queueOrders >= 5) {
      price += 10;
    }

    if (queueOrders >= 10) {
      price += 20;
    }

    if (avgCookTimeMinutes > 30) {
      price += 10;
    }

    if (kitchenLoad < 30 && hour >= 15) {
      price -= 15;
    }

    const minPrice = Math.round(basePrice * 0.85);
    const maxPrice = Math.round(basePrice * 1.35);

    return Math.min(maxPrice, Math.max(minPrice, Math.round(price)));
  }

  function hashSymbol(symbol) {
    return String(symbol || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function initialMetrics(symbol, basePrice, index = 0) {
    const hash = hashSymbol(symbol) + index * 37;
    return {
      avgCookTimeMinutes: 14 + (hash % 16),
      kitchenLoad: 38 + (hash % 48),
      queueOrders: 2 + (hash % 7),
      ordersToday: 18 + (hash % 42),
      change24h: Number(((hash % 145) / 10 - 3.5).toFixed(1)),
      basePrice
    };
  }

  function demandStatus(kitchenLoad, queueOrders) {
    if (kitchenLoad >= 82 || queueOrders >= 8) return "high demand";
    if (kitchenLoad <= 32 && queueOrders <= 2) return "discount window";
    if (kitchenLoad >= 62 || queueOrders >= 5) return "active";
    return "calm kitchen";
  }

  function cookTimeLabel(avgCookTimeMinutes, queueOrders) {
    const min = Math.max(8, Math.round(avgCookTimeMinutes + queueOrders * 0.7 - 4));
    const max = min + 8 + Math.min(8, queueOrders);
    return `${min}-${max} min`;
  }

  function createCandles(symbol, basePrice, currentPrice, ordersToday) {
    const hash = hashSymbol(symbol);
    const now = new Date();
    const candles = [];
    let open = Math.max(1, Math.round(basePrice + ((hash % 11) - 5)));
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const isLast = i === 0;
      const drift = ((hash + i * 13) % 17) - 8;
      const close = isLast ? currentPrice : Math.max(1, Math.round(open + drift));
      const high = Math.max(open, close) + 4 + ((hash + i) % 9);
      const low = Math.max(1, Math.min(open, close) - 4 - ((hash + i * 3) % 8));
      const volume = isLast
        ? Math.max(1, Math.round(ordersToday / 3))
        : 4 + ((hash + i * 5) % 18);
      candles.push({
        time: date.toISOString().slice(0, 10),
        open,
        high,
        low,
        close,
        volume
      });
      open = close;
    }
    return candles;
  }

  function updateLastCandle(candles, currentPrice, volumeDelta = 0) {
    const today = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(candles) || !candles.length) return [];
    const last = candles[candles.length - 1];
    if (last.time !== today) {
      candles.push({
        time: today,
        open: last.close,
        high: Math.max(last.close, currentPrice),
        low: Math.min(last.close, currentPrice),
        close: currentPrice,
        volume: Math.max(1, volumeDelta)
      });
      return candles.slice(-12);
    }
    last.high = Math.max(last.high, currentPrice);
    last.low = Math.min(last.low, currentPrice);
    last.close = currentPrice;
    last.volume = Math.max(1, Number(last.volume || 0) + volumeDelta);
    return candles;
  }

  function stateFor(symbol, basePrice, index) {
    const state = readJson(MARKET_STATE_KEY, {});
    if (state[symbol]) return { state, itemState: state[symbol] };

    const metrics = initialMetrics(symbol, basePrice, index);
    const hour = new Date().getHours();
    const currentPrice = calculateMarketPrice({ ...metrics, hour });
    const itemState = {
      ...metrics,
      currentPrice,
      candles: createCandles(symbol, basePrice, currentPrice, metrics.ordersToday)
    };
    return { state, itemState };
  }

  function saveItemState(symbol, itemState) {
    const state = readJson(MARKET_STATE_KEY, {});
    state[symbol] = itemState;
    writeJson(MARKET_STATE_KEY, state);
  }

  function symbolFor(menuItem) {
    return String(menuItem.requestedCode || menuItem.code || menuItem.key || "").trim();
  }

  function categoryLabel(category) {
    const labels = {
      salat_bun: "Bun salad",
      wok_fried_mien: "Wok Mien",
      wok_fried_mi: "Wok Mi",
      fried_rice: "Fried rice",
      appetizers: "Snacks"
    };
    return labels[category] || category || "DRAGON";
  }

  function createSummerMarketItem(menuItem) {
    if (!menuItem) return null;
    const symbol = symbolFor(menuItem);
    const basePrice = Number(menuItem.price || menuItem.menuItem?.price || 0);
    const index = Number(menuItem.index || 0);
    const { itemState } = stateFor(symbol, basePrice, index);
    const hour = new Date().getHours();
    const currentPrice = calculateMarketPrice({ ...itemState, basePrice, hour });
    const candles = updateLastCandle(
      Array.isArray(itemState.candles) ? itemState.candles : createCandles(symbol, basePrice, currentPrice, itemState.ordersToday),
      currentPrice,
      0
    );
    const previousClose = candles.length > 1 ? Number(candles[candles.length - 2].close || basePrice) : basePrice;
    const change24h = previousClose
      ? Number((((currentPrice - previousClose) / previousClose) * 100).toFixed(1))
      : Number(itemState.change24h || 0);

    return {
      id: menuItem.cartId || `${menuItem.category}:${menuItem.index}`,
      key: menuItem.key,
      code: menuItem.code,
      symbol,
      pair: `${symbol}/UAH`,
      name: textByLocale(menuItem.translations) || String(menuItem.key || symbol).replaceAll("_", " "),
      category: menuItem.category,
      categoryLabel: categoryLabel(menuItem.category),
      image: menuItem.image || "",
      basePrice,
      currentPrice,
      change24h,
      avgCookTimeMinutes: Number(itemState.avgCookTimeMinutes || 18),
      cookTimeLabel: cookTimeLabel(Number(itemState.avgCookTimeMinutes || 18), Number(itemState.queueOrders || 0)),
      kitchenLoad: clamp(Number(itemState.kitchenLoad || 0), 0, 99),
      queueOrders: Math.max(0, Number(itemState.queueOrders || 0)),
      ordersToday: Math.max(0, Number(itemState.ordersToday || 0)),
      demandStatus: demandStatus(Number(itemState.kitchenLoad || 0), Number(itemState.queueOrders || 0)),
      volume: candles.reduce((sum, candle) => sum + Number(candle.volume || 0), 0),
      candles,
      menuItem
    };
  }

  function getSummerMarketItems(menuData) {
    return getSummerTopItems(menuData).map(createSummerMarketItem).filter(Boolean);
  }

  function getSummerMarketBySymbol(symbol, menuData) {
    const normalized = normalizeCode(symbol);
    return getSummerMarketItems(menuData).find(item =>
      normalizeCode(item.symbol) === normalized ||
      normalizeCode(item.code) === normalized ||
      normalizeCode(item.key) === normalized
    ) || null;
  }

  function buildImageCandidates(item) {
    const source = item?.menuItem || item || {};
    const candidates = [];
    if (source.image) candidates.push(source.image);
    [source.key, source.code, item?.symbol].filter(Boolean).forEach(key => {
      ["webp", "jpg", "jpeg", "png"].forEach(ext => candidates.push(`images/${key}.${ext}`));
    });
    return [...new Set(candidates)];
  }

  function mutateMarketItem(symbol, updater) {
    const item = getSummerMarketBySymbol(symbol);
    if (!item) return null;
    const baseState = {
      avgCookTimeMinutes: item.avgCookTimeMinutes,
      kitchenLoad: item.kitchenLoad,
      queueOrders: item.queueOrders,
      ordersToday: item.ordersToday,
      currentPrice: item.currentPrice,
      candles: item.candles
    };
    const next = updater({ ...baseState }) || baseState;
    const hour = new Date().getHours();
    next.currentPrice = calculateMarketPrice({
      basePrice: item.basePrice,
      kitchenLoad: next.kitchenLoad,
      queueOrders: next.queueOrders,
      avgCookTimeMinutes: next.avgCookTimeMinutes,
      hour
    });
    next.candles = updateLastCandle(next.candles, next.currentPrice, next.volumeDelta || 0);
    delete next.volumeDelta;
    saveItemState(item.symbol, next);
    return getSummerMarketBySymbol(symbol);
  }

  function readCart() {
    return readJson(CART_KEY, {});
  }

  function writeCart(cart) {
    writeJson(CART_KEY, cart || {});
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: CART_KEY }));
    } catch (_) {
      window.dispatchEvent(new CustomEvent("dragon-cart-updated", { detail: { key: CART_KEY } }));
    }
  }

  function addMarketItemToCart(symbol, qty = 1) {
    const item = getSummerMarketBySymbol(symbol);
    if (!item) return null;
    const cart = readCart();
    const entry = cart[item.id] || { qty: 0, selections: {}, note: "" };
    const lockedPrice = Number(entry.lockedPrice || item.currentPrice);
    cart[item.id] = {
      ...entry,
      qty: Math.max(0, Number(entry.qty || 0)) + Math.max(1, Number(qty || 1)),
      selections: entry.selections || {},
      note: entry.note || "",
      lockedPrice,
      marketSymbol: item.symbol,
      marketPair: item.pair,
      marketPriceLocked: true,
      marketLockedAt: entry.marketLockedAt || new Date().toISOString()
    };
    writeCart(cart);
    const updated = mutateMarketItem(item.symbol, state => ({
      ...state,
      ordersToday: Number(state.ordersToday || 0) + 1,
      queueOrders: clamp(Number(state.queueOrders || 0) + 1, 0, 99),
      kitchenLoad: clamp(Number(state.kitchenLoad || 0) + 4, 0, 99),
      volumeDelta: 1
    }));
    return { item: updated || item, lockedPrice, cartEntry: cart[item.id] };
  }

  function reserveKitchenTime(symbol) {
    const item = getSummerMarketBySymbol(symbol);
    if (!item) return null;
    const reservations = readJson(RESERVATIONS_KEY, []);
    const now = Date.now();
    const reservation = {
      id: `dmr-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      symbol: item.symbol,
      pair: item.pair,
      lockedPrice: item.currentPrice,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 10 * 60 * 1000).toISOString()
    };
    reservations.push(reservation);
    writeJson(RESERVATIONS_KEY, reservations.slice(-30));
    mutateMarketItem(item.symbol, state => ({
      ...state,
      queueOrders: clamp(Number(state.queueOrders || 0) + 1, 0, 99),
      kitchenLoad: clamp(Number(state.kitchenLoad || 0) + 2, 0, 99)
    }));
    return reservation;
  }

  function watchPrice(symbol) {
    const item = getSummerMarketBySymbol(symbol);
    if (!item) return null;
    const watchlist = readJson(WATCHLIST_KEY, []);
    if (!watchlist.includes(item.symbol)) watchlist.push(item.symbol);
    writeJson(WATCHLIST_KEY, watchlist);
    return item;
  }

  function catchDiscount(symbol) {
    const item = getSummerMarketBySymbol(symbol);
    if (!item) return null;
    const alerts = readJson(ALERTS_KEY, {});
    alerts[item.symbol] = {
      symbol: item.symbol,
      condition: "kitchenLoad < 30 or currentPrice < basePrice",
      createdAt: new Date().toISOString()
    };
    writeJson(ALERTS_KEY, alerts);
    return alerts[item.symbol];
  }

  function formatMoney(value) {
    return `${Number(value || 0).toFixed(0)} ${CURRENCY}`;
  }

  window.DRAGON_MARKET = {
    SUMMER_TOP_CODES,
    calculateMarketPrice,
    flattenMenu,
    findMenuItemByCode,
    getSummerTopItems,
    createSummerMarketItem,
    getSummerMarketItems,
    getSummerMarketBySymbol,
    buildImageCandidates,
    addMarketItemToCart,
    reserveKitchenTime,
    watchPrice,
    catchDiscount,
    formatMoney
  };
})();
