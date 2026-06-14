(function attachDragonStaticConfig(global) {
  "use strict";

  const location = global.location;
  const protocol = String(location?.protocol || "");
  const hostname = String(location?.hostname || "").toLowerCase();
  const params = new URLSearchParams(String(location?.search || ""));
  const bridgeStorageKey = "DRAGON_REMOTE_BRIDGE_URL";
  const bridgeTokenStorageKey = "DRAGON_REMOTE_BRIDGE_TOKEN";
  const paymentUrlStorageKey = "DRAGON_ONLINE_PAYMENT_URL";
  const paymentLabelStorageKey = "DRAGON_ONLINE_PAYMENT_LABEL";
  const forceStatic = params.get("static") === "1" || params.get("github") === "1";
  const forceBridge = params.get("bridge") === "1";
  const isHttp = protocol === "http:" || protocol === "https:";
  const isGithubPages = hostname.endsWith(".github.io");
  const isLoopback = (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.startsWith("127.")
  );

  function safeStorageGet(key) {
    try {
      return String(global.localStorage?.getItem(key) || "");
    } catch (_) {
      return "";
    }
  }

  function safeStorageSet(key, value) {
    try {
      if (!global.localStorage) return;
      if (value) {
        global.localStorage.setItem(key, value);
      } else {
        global.localStorage.removeItem(key);
      }
    } catch (_) {
      // Ignore storage errors in private / restricted contexts.
    }
  }

  function normalizeBridgeBase(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, isHttp ? location.href : undefined);
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      return url.origin + url.pathname.replace(/\/+$/, "");
    } catch (_) {
      return "";
    }
  }

  function normalizeBridgeToken(rawValue) {
    return String(rawValue || "").trim();
  }

  function normalizeExternalUrl(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, isHttp ? location.href : undefined);
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      return url.toString();
    } catch (_) {
      return "";
    }
  }

  function normalizeLabel(rawValue) {
    return String(rawValue || "").trim();
  }

  function decorateBridgeApiUrl(baseUrl, token) {
    const normalized = normalizeExternalUrl(baseUrl);
    if (!normalized) return "";
    if (!token) return normalized;

    try {
      const apiUrl = new URL(normalized);
      const apiOrigin = apiUrl.origin;
      if (origin && apiOrigin === origin) {
        return normalized;
      }
      if (!apiUrl.searchParams.get("bridgeToken")) {
        apiUrl.searchParams.set("bridgeToken", token);
      }
      return apiUrl.toString();
    } catch (_) {
      return normalized;
    }
  }

  const origin = isHttp ? location.origin : "";
  const defaultOnlinePaymentUrl = "https://bank.gov.ua/qr/QkNECjAwMgoxClVDVAoK0JvRlCDQotGF0ZYg0JrRhdCw0L3RjCDQm9GWClVBNDczMjIwMDEwMDAwMDI2MjAwMzQ0NTAzNjYwCgozMzAwMzIxNzYyCgoK0J_QvtC_0L7QstC90LXQvdC90Y8g0YDQsNGF0YPQvdC60YMKCg==";
  const defaultOnlinePaymentLabel = "Universal Bank";
  const allowQueryPaymentOverride = isLoopback || Boolean(global.DRAGON_ALLOW_QUERY_PAYMENT_URL);
  const paramBridgeBase = normalizeBridgeBase(
    params.get("bridgeUrl") ||
    params.get("bridge_url") ||
    params.get("remoteBridge") ||
    params.get("remote_bridge")
  );
  const paramBridgeToken = normalizeBridgeToken(
    params.get("bridgeToken") ||
    params.get("bridge_token") ||
    params.get("remoteBridgeToken") ||
    params.get("remote_bridge_token")
  );
  const paramPaymentUrl = allowQueryPaymentOverride ? normalizeExternalUrl(
    params.get("payUrl") ||
    params.get("pay_url") ||
    params.get("paymentUrl") ||
    params.get("payment_url") ||
    params.get("onlinePaymentUrl") ||
    params.get("online_payment_url")
  ) : "";
  const paramPaymentLabel = allowQueryPaymentOverride ? normalizeLabel(
    params.get("payLabel") ||
    params.get("pay_label") ||
    params.get("paymentLabel") ||
    params.get("payment_label") ||
    params.get("onlinePaymentLabel") ||
    params.get("online_payment_label")
  ) : "";
  const explicitBridgeBase = normalizeBridgeBase(global.DRAGON_REMOTE_BRIDGE_URL || "");
  const explicitBridgeToken = normalizeBridgeToken(global.DRAGON_REMOTE_BRIDGE_TOKEN || "");
  const explicitPaymentUrl = normalizeExternalUrl(global.DRAGON_ONLINE_PAYMENT_URL || "");
  const explicitPaymentLabel = normalizeLabel(
    global.DRAGON_ONLINE_PAYMENT_LABEL ||
    global.DRAGON_PAYMENT_PROVIDER_LABEL ||
    ""
  );
  const storedBridgeBase = normalizeBridgeBase(safeStorageGet(bridgeStorageKey));
  const storedBridgeToken = normalizeBridgeToken(safeStorageGet(bridgeTokenStorageKey));
  const storedPaymentUrl = normalizeExternalUrl(safeStorageGet(paymentUrlStorageKey));
  const storedPaymentLabel = normalizeLabel(safeStorageGet(paymentLabelStorageKey));
  if (paramBridgeBase) {
    safeStorageSet(bridgeStorageKey, paramBridgeBase);
  } else if (params.get("bridgeUrl") === "" || params.get("bridge_url") === "" || params.get("bridge") === "0") {
    safeStorageSet(bridgeStorageKey, "");
  }
  if (paramBridgeToken) {
    safeStorageSet(bridgeTokenStorageKey, paramBridgeToken);
  } else if (
    params.get("bridgeToken") === "" ||
    params.get("bridge_token") === "" ||
    params.get("bridge") === "0"
  ) {
    safeStorageSet(bridgeTokenStorageKey, "");
  }
  if (allowQueryPaymentOverride && paramPaymentUrl) {
    safeStorageSet(paymentUrlStorageKey, paramPaymentUrl);
  } else if (
    allowQueryPaymentOverride && (
      params.get("payUrl") === "" ||
      params.get("pay_url") === "" ||
      params.get("paymentUrl") === "" ||
      params.get("payment_url") === ""
    )
  ) {
    safeStorageSet(paymentUrlStorageKey, "");
  }
  if (allowQueryPaymentOverride && paramPaymentLabel) {
    safeStorageSet(paymentLabelStorageKey, paramPaymentLabel);
  } else if (
    allowQueryPaymentOverride && (
      params.get("payLabel") === "" ||
      params.get("pay_label") === "" ||
      params.get("paymentLabel") === "" ||
      params.get("payment_label") === ""
    )
  ) {
    safeStorageSet(paymentLabelStorageKey, "");
  }

  const sameOriginBridgeBase = isHttp && !forceStatic && !isGithubPages ? origin : "";
  const bridgeBase =
    forceStatic ? "" :
    paramBridgeBase ||
    explicitBridgeBase ||
    storedBridgeBase ||
    sameOriginBridgeBase ||
    (forceBridge && origin ? origin : "");
  const bridgeToken =
    forceStatic ? "" :
    paramBridgeToken ||
    explicitBridgeToken ||
    storedBridgeToken;
  const onlinePaymentUrl =
    paramPaymentUrl ||
    explicitPaymentUrl ||
    storedPaymentUrl ||
    defaultOnlinePaymentUrl;
  const onlinePaymentLabel =
    paramPaymentLabel ||
    explicitPaymentLabel ||
    storedPaymentLabel ||
    defaultOnlinePaymentLabel;
  const hasLocalBridge = Boolean(bridgeBase);
  const buildBridgeApiUrl = path => {
    if (!hasLocalBridge) return "";
    return decorateBridgeApiUrl(`${bridgeBase}${path}`, bridgeToken);
  };

  const staticConfig = {
    isHttp,
    isGithubPages,
    isLoopback,
    forceStatic,
    bridgeBase,
    bridgeToken,
    hasLocalBridge,
    isStaticOnly: !hasLocalBridge,
    localOrdersApi: buildBridgeApiUrl("/api/local-orders"),
    localEventsUrl: buildBridgeApiUrl("/api/local-events"),
    menuAvailabilityApi: buildBridgeApiUrl("/api/menu-availability"),
    telegramMessageApi: buildBridgeApiUrl("/api/telegram/send-message"),
    telegramDocumentApi: buildBridgeApiUrl("/api/telegram/send-document"),
    liqpayCheckoutApi: buildBridgeApiUrl("/api/liqpay/checkout"),
    kassaSessionApi: buildBridgeApiUrl("/api/kassa/session"),
    onlinePaymentUrl,
    onlinePaymentLabel,
    allowQueryPaymentOverride,
    normalizeExternalUrl,
    remoteBridgeStorageKey: bridgeStorageKey,
    remoteBridgeTokenStorageKey: bridgeTokenStorageKey,
    onlinePaymentStorageKey: paymentUrlStorageKey,
    onlinePaymentLabelStorageKey: paymentLabelStorageKey,
    setBridgeBase(nextBridgeBase) {
      const normalized = normalizeBridgeBase(nextBridgeBase);
      safeStorageSet(bridgeStorageKey, normalized);
      return normalized;
    },
    setBridgeToken(nextBridgeToken) {
      const normalized = normalizeBridgeToken(nextBridgeToken);
      safeStorageSet(bridgeTokenStorageKey, normalized);
      return normalized;
    },
    clearBridgeBase() {
      safeStorageSet(bridgeStorageKey, "");
    },
    clearBridgeToken() {
      safeStorageSet(bridgeTokenStorageKey, "");
    },
    setOnlinePaymentUrl(nextPaymentUrl) {
      const normalized = normalizeExternalUrl(nextPaymentUrl);
      safeStorageSet(paymentUrlStorageKey, normalized);
      return normalized;
    },
    setOnlinePaymentLabel(nextPaymentLabel) {
      const normalized = normalizeLabel(nextPaymentLabel);
      safeStorageSet(paymentLabelStorageKey, normalized);
      return normalized;
    },
    clearOnlinePaymentUrl() {
      safeStorageSet(paymentUrlStorageKey, "");
    },
    clearOnlinePaymentLabel() {
      safeStorageSet(paymentLabelStorageKey, "");
    }
  };

  global.DRAGON_STATIC = staticConfig;
})(window);
