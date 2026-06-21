(function attachDragonModifiers(global) {
  const MEAT_PORTION = 80;
  const NEM_PORTION = 1;
  const PHO_BAG_GRAMS = 500;
  const PHO_BAG_PORTIONS = 7;
  const PHO_PORTION = Number((PHO_BAG_GRAMS / PHO_BAG_PORTIONS).toFixed(2));
  const MIX_STOCK = { tom: 30, bo: 30, ga: 30, heo: 30 };

  const STOCK_ITEMS = {
    bo: { key: "bo", name: "Thit bo / Говядина", portionNorm: MEAT_PORTION, unit: "g", aliases: ["говядина", "ялович", "thit bo", "bo"] },
    ga: { key: "ga", name: "Thit ga / Курица", portionNorm: MEAT_PORTION, unit: "g", aliases: ["курица", "курка", "thit ga", "ga"] },
    heo: { key: "heo", name: "Thit heo / Свинина", portionNorm: MEAT_PORTION, unit: "g", aliases: ["свинина", "thit heo", "heo", "lon"] },
    tom: { key: "tom", name: "Tom / Креветки", portionNorm: 100, unit: "g", aliases: ["креветки", "tôm", "tom"] },
    ga_xu: { key: "ga_xu", name: "Ga xu / Курица в панировке", portionNorm: 120, unit: "g", aliases: ["ga xu", "chiên xù", "панировк"] },
    nem: { key: "nem", name: "Nem", portionNorm: NEM_PORTION, unit: "шт", aliases: ["nem", "нем"] },
    banh_bao: { key: "banh_bao", name: "Banh bao", portionNorm: 1, unit: "шт", aliases: ["banh bao", "бао"] },
    pho: { key: "pho", name: "Pho / Banh pho", portionNorm: PHO_PORTION, unit: "g", aliases: ["pho", "phở"] },
    bun: { key: "bun", name: "Bun", portionNorm: 300, unit: "g", aliases: ["bun", "bún"] },
    mien: { key: "mien", name: "Mien", portionNorm: 300, unit: "g", aliases: ["mien", "miến"] },
    mi: { key: "mi", name: "Mi", portionNorm: 300, unit: "g", aliases: ["mi", "mì"] },
    com: { key: "com", name: "Com / Rice", portionNorm: 300, unit: "g", aliases: ["com", "cơm", "рис"] },
    com_rang: { key: "com_rang", name: "Com rang / Fried rice", portionNorm: 300, unit: "g", aliases: ["com rang", "cơm rang", "fried rice", "смажен"] },
    rau: { key: "rau", name: "Rau / Зелень и салат", portionNorm: 100, unit: "g", aliases: ["rau", "салат", "зелень"] },
    nuoc_xuong: { key: "nuoc_xuong", name: "Nuoc xuong / Бульон", portionNorm: 450, unit: "ml", aliases: ["nuoc xuong", "бульон", "xương"] },
    bo_huc: { key: "bo_huc", name: "Bo huc", portionNorm: 1, unit: "шт", aliases: ["bo huc"] },
    ca_phe_viet: { key: "ca_phe_viet", name: "Ca phe Viet", portionNorm: 1, unit: "шт", aliases: ["ca phe viet"] },
    p03: { key: "p03", name: "Pepsi-Cola 0.33", portionNorm: 1, unit: "шт", aliases: ["pepsi-cola 0.33", "pepsi cola 0.33"] },
    pbl: { key: "pbl", name: "Pepsi Black 0.5", portionNorm: 1, unit: "шт", aliases: ["pepsi black 0.5"] },
    pcs33: { key: "pcs33", name: "Pepsi Cream Soda 0.33", portionNorm: 1, unit: "шт", aliases: ["pepsi cream soda 0.33"] },
    psc33: { key: "psc33", name: "Pepsi Strawberry Cream 0.33", portionNorm: 1, unit: "шт", aliases: ["pepsi strawberry cream 0.33", "клубника и сливки 0.33"] },
    pz33: { key: "pz33", name: "Pepsi Zero Sugar 0.33", portionNorm: 1, unit: "шт", aliases: ["pepsi zero sugar 0.33"] },
    p50: { key: "p50", name: "Pepsi-Cola 0.5", portionNorm: 1, unit: "шт", aliases: ["pepsi-cola 0.5", "pepsi cola 0.5"] },
    ptr50: { key: "ptr50", name: "Pepsi Tropical 0.5", portionNorm: 1, unit: "шт", aliases: ["pepsi tropical 0.5"] },
    soft_drink: { key: "soft_drink", name: "Mirinda / 7UP", portionNorm: 1, unit: "шт", aliases: ["7up", "mirinda"] },
    water: { key: "water", name: "Water", portionNorm: 1, unit: "шт", aliases: ["water", "вода", "nuoc"] },
    juice: { key: "juice", name: "Juice", portionNorm: 1, unit: "шт", aliases: ["juice", "сок"] },
    jt50: { key: "jt50", name: "Сок Садочок томатный 0.5", portionNorm: 1, unit: "шт", aliases: ["nuoc ep ca chua sadochok 0.5", "томатный 0.5"] },
    jag50: { key: "jag50", name: "Сок Садочок яблочно-виноградный 0.5", portionNorm: 1, unit: "шт", aliases: ["nuoc ep tao nho sadochok 0.5", "яблочно-виноградный 0.5"] },
    jm50: { key: "jm50", name: "Сок Садочок мультифрукт 0.5", portionNorm: 1, unit: "шт", aliases: ["nuoc ep da trai cay sadochok 0.5", "мультифрукт 0.5"] },
    pepsi: { key: "pepsi", name: "Pepsi old / legacy", portionNorm: 1, unit: "шт", aliases: ["pepsi"] }
  };

  function roundMetric(value, digits = 2) {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return 0;
    const factor = 10 ** digits;
    return Math.round(num * factor) / factor;
  }

  function normalizeCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  function normalizeLookup(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cloneUsage(usage) {
    return Object.fromEntries(Object.entries(usage || {}).map(([key, value]) => [key, roundMetric(value)]));
  }

  function mergeUsage(left, right) {
    const merged = {};
    for (const [key, value] of Object.entries(left || {})) {
      merged[key] = roundMetric((merged[key] || 0) + Number(value || 0));
    }
    for (const [key, value] of Object.entries(right || {})) {
      merged[key] = roundMetric((merged[key] || 0) + Number(value || 0));
    }
    return merged;
  }

  function scaleUsage(usage, multiplier) {
    const scaled = {};
    const units = Math.max(0, Number(multiplier || 0));
    for (const [key, value] of Object.entries(usage || {})) {
      scaled[key] = roundMetric(Number(value || 0) * units);
    }
    return scaled;
  }

  function makeAddon(code, name, stockKey, config) {
    return {
      code,
      name,
      stockKey,
      allowedGrams: config.allowedGrams || null,
      defaultGrams: config.defaultGrams || null,
      allowedQty: config.allowedQty || null,
      defaultQty: config.defaultQty || null,
      price: { ...(config.price || {}) }
    };
  }

  const ADDONS = {
    B: makeAddon("B", "говядина", "bo", {
      allowedGrams: [30, 50, 100],
      defaultGrams: 50,
      price: { 30: 35, 50: 50, 100: 100 }
    }),
    G: makeAddon("G", "курица", "ga", {
      allowedGrams: [30, 50, 100],
      defaultGrams: 50,
      price: { 30: 35, 50: 50, 100: 100 }
    }),
    L: makeAddon("L", "свинина", "heo", {
      allowedGrams: [30, 50, 100],
      defaultGrams: 50,
      price: { 30: 35, 50: 50, 100: 100 }
    }),
    T: makeAddon("T", "креветки", "tom", {
      allowedGrams: [30, 50, 80, 100],
      defaultGrams: 30,
      price: { 30: 40, 50: 60, 80: 90, 100: 110 }
    }),
    GX: makeAddon("GX", "курица в панировке", "ga_xu", {
      allowedGrams: [120],
      defaultGrams: 120,
      price: { 120: 90 }
    }),
    R: makeAddon("R", "зелень", "rau", {
      allowedGrams: [50, 100, 150],
      defaultGrams: 100,
      price: { 50: 15, 100: 25, 150: 35 }
    }),
    NEM: makeAddon("NEM", "нем", "nem", {
      allowedQty: [1, 2, 3],
      defaultQty: 1,
      price: { 1: 35, 2: 70, 3: 105 }
    })
  };

  function addBase(target, code, entry) {
    target[normalizeCode(code)] = {
      code: normalizeCode(code),
      menuCode: entry.menuCode ? normalizeCode(entry.menuCode) : normalizeCode(code),
      name: entry.name,
      price: Number(entry.price || 0),
      base: cloneUsage(entry.base),
      stock: cloneUsage(entry.stock),
      aliases: (entry.aliases || []).map(normalizeCode),
      menuKey: entry.menuKey || ""
    };
  }

  const BASE_PORTIONS = {};

  [
    ["PB", { menuCode: "PBx", name: "Pho bo", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: { bo: 100 }, aliases: ["PBX"] }],
    ["PG", { menuCode: "PGx", name: "Pho ga", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga: 100 }, aliases: ["PGX"] }],
    ["PL", { menuCode: "PLx", name: "Pho heo", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: { heo: 100 }, aliases: ["PLX"] }],
    ["PT", { menuCode: "PT", name: "Pho tom", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: { tom: 100 } }],
    ["PGCX", { menuCode: "PGCx", name: "Pho ga chien xu", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga_xu: 120 } }],
    ["PMIX", { menuCode: "PMix", name: "Pho mix", price: 200, base: { pho: 300, rau: 100, nuoc_xuong: 450 }, stock: MIX_STOCK }],
    ["MB", { menuCode: "MB", name: "Mi nuoc bo", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: { bo: 100 } }],
    ["MG", { menuCode: "MG", name: "Mi nuoc ga", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga: 100 } }],
    ["ML", { menuCode: "ML", name: "Mi nuoc heo", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: { heo: 100 } }],
    ["MT", { menuCode: "MT", name: "Mi nuoc tom", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: { tom: 100 } }],
    ["MGCX", { menuCode: "MGCx", name: "Mi nuoc ga chien xu", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga_xu: 120 } }],
    ["MMIX", { menuCode: "MMix", name: "Mi nuoc mix", price: 200, base: { mi: 300, rau: 100, nuoc_xuong: 450 }, stock: MIX_STOCK }],
    ["MNB", { menuCode: "MnB", name: "Mien nuoc bo", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: { bo: 100 } }],
    ["MNG", { menuCode: "MnG", name: "Mien nuoc ga", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga: 100 } }],
    ["MNL", { menuCode: "MnL", name: "Mien nuoc heo", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: { heo: 100 } }],
    ["MNT", { menuCode: "MnT", name: "Mien nuoc tom", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: { tom: 100 } }],
    ["MNGCX", { menuCode: "MnGCx", name: "Mien nuoc ga chien xu", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga_xu: 120 } }],
    ["MNMIX", { menuCode: "MnMix", name: "Mien nuoc mix", price: 200, base: { mien: 300, rau: 100, nuoc_xuong: 450 }, stock: MIX_STOCK }],
    ["BB", { menuCode: "BBx", name: "Bun bo soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: { bo: 100 }, aliases: ["BBX"] }],
    ["BG", { menuCode: "BGx", name: "Bun ga soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga: 100 }, aliases: ["BGX"] }],
    ["BL", { menuCode: "BLx", name: "Bun heo soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: { heo: 100 }, aliases: ["BLX"] }],
    ["BT", { menuCode: "BT", name: "Bun tom soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: { tom: 100 } }],
    ["BGCX", { menuCode: "BGCx", name: "Bun ga chien xu soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: { ga_xu: 120 } }],
    ["BMIX", { menuCode: "BMix", name: "Bun mix soup", price: 200, base: { bun: 300, rau: 100, nuoc_xuong: 450 }, stock: MIX_STOCK }],
    ["BSB", { menuCode: "BsB", name: "Bun salad bo", price: 200, base: { bun: 300, rau: 100 }, stock: { bo: 100 } }],
    ["BSG", { menuCode: "BsG", name: "Bun salad ga", price: 200, base: { bun: 300, rau: 100 }, stock: { ga: 100 } }],
    ["BST", { menuCode: "BsT", name: "Bun salad tom", price: 200, base: { bun: 300, rau: 100 }, stock: { tom: 100 } }],
    ["BSGCX", { menuCode: "BsGCx", name: "Bun salad ga chien xu", price: 200, base: { bun: 300, rau: 100 }, stock: { ga_xu: 120 } }],
    ["BSN", { menuCode: "BsN", name: "Bun salad nem", price: 200, base: { bun: 300, rau: 100 }, stock: { nem: 2 } }],
    ["BSMIX", { menuCode: "BsMix", name: "Bun salad mix", price: 200, base: { bun: 300, rau: 100 }, stock: MIX_STOCK }],
    ["MXB", { menuCode: "MXB", name: "Mien xao bo", price: 250, base: { mien: 300, rau: 100 }, stock: { bo: 100 } }],
    ["MXG", { menuCode: "MXG", name: "Mien xao ga", price: 250, base: { mien: 300, rau: 100 }, stock: { ga: 100 } }],
    ["MXH", { menuCode: "MXH", name: "Mien xao heo", price: 250, base: { mien: 300, rau: 100 }, stock: { heo: 100 } }],
    ["MXT", { menuCode: "MXT", name: "Mien xao tom", price: 250, base: { mien: 300, rau: 100 }, stock: { tom: 100 } }],
    ["MXGCX", { menuCode: "MXGCx", name: "Mien xao ga chien xu", price: 250, base: { mien: 300, rau: 100 }, stock: { ga_xu: 120 } }],
    ["MXMIX", { menuCode: "MXMix", name: "Mien xao mix", price: 250, base: { mien: 300, rau: 100 }, stock: MIX_STOCK }],
    ["MTXB", { menuCode: "MTxB", name: "Mi xao bo", price: 250, base: { mi: 300, rau: 100 }, stock: { bo: 100 }, aliases: ["MIXB"] }],
    ["MTXG", { menuCode: "MTxG", name: "Mi xao ga", price: 250, base: { mi: 300, rau: 100 }, stock: { ga: 100 }, aliases: ["MIXG"] }],
    ["MTXL", { menuCode: "MTxL", name: "Mi xao heo", price: 250, base: { mi: 300, rau: 100 }, stock: { heo: 100 }, aliases: ["MIXL"] }],
    ["MTXT", { menuCode: "MTxT", name: "Mi xao tom", price: 270, base: { mi: 300, rau: 100 }, stock: { tom: 100 }, aliases: ["MIXT"] }],
    ["MTXGCX", { menuCode: "MTxGCx", name: "Mi xao ga chien xu", price: 250, base: { mi: 300, rau: 100 }, stock: { ga_xu: 120 }, aliases: ["MIXGCx"] }],
    ["MTXMIX", { menuCode: "MTxMix", name: "Mi xao mix", price: 250, base: { mi: 300, rau: 100 }, stock: MIX_STOCK, aliases: ["MIXMix", "MIXMIX"] }],
    ["PXB", { menuCode: "PXB", name: "Pho xao bo", price: 250, base: { pho: 300, rau: 100 }, stock: { bo: 100 } }],
    ["PXG", { menuCode: "PXG", name: "Pho xao ga", price: 250, base: { pho: 300, rau: 100 }, stock: { ga: 100 } }],
    ["PXH", { menuCode: "PXH", name: "Pho xao heo", price: 250, base: { pho: 300, rau: 100 }, stock: { heo: 100 } }],
    ["PXT", { menuCode: "PXT", name: "Pho xao tom", price: 250, base: { pho: 300, rau: 100 }, stock: { tom: 100 } }],
    ["PXGCX", { menuCode: "PXGCx", name: "Pho xao ga chien xu", price: 250, base: { pho: 300, rau: 100 }, stock: { ga_xu: 120 } }],
    ["PXMIX", { menuCode: "PXMix", name: "Pho xao mix", price: 250, base: { pho: 300, rau: 100 }, stock: MIX_STOCK }],
    ["CB", { menuCode: "CB", name: "Com bo", price: 200, base: { com: 300, rau: 100 }, stock: { bo: 100 } }],
    ["CG", { menuCode: "CG", name: "Com ga", price: 200, base: { com: 300, rau: 100 }, stock: { ga: 100 } }],
    ["CL", { menuCode: "CL", name: "Com heo", price: 200, base: { com: 300, rau: 100 }, stock: { heo: 100 } }],
    ["CT", { menuCode: "CT", name: "Com tom", price: 200, base: { com: 300, rau: 100 }, stock: { tom: 100 } }],
    ["CGCX", { menuCode: "CGCx", name: "Com ga chien xu", price: 200, base: { com: 300, rau: 100 }, stock: { ga_xu: 120 } }],
    ["CMIX", { menuCode: "CMix", name: "Com mix", price: 200, base: { com: 300, rau: 100 }, stock: MIX_STOCK }],
    ["CNEM", { menuCode: "CNem", name: "Com nem", price: 200, base: { com: 300, rau: 100 }, stock: { nem: 2 } }],
    ["CRB", { menuCode: "CRB", name: "Com rang bo", price: 200, base: { com_rang: 300, rau: 100 }, stock: { bo: 100 } }],
    ["CRG", { menuCode: "CRG", name: "Com rang ga", price: 200, base: { com_rang: 300, rau: 100 }, stock: { ga: 100 } }],
    ["CRL", { menuCode: "CRL", name: "Com rang heo", price: 200, base: { com_rang: 300, rau: 100 }, stock: { heo: 100 } }],
    ["CRT", { menuCode: "CRT", name: "Com rang tom", price: 200, base: { com_rang: 300, rau: 100 }, stock: { tom: 100 } }],
    ["CRGCX", { menuCode: "CRGCx", name: "Com rang ga chien xu", price: 200, base: { com_rang: 300, rau: 100 }, stock: { ga_xu: 120 } }],
    ["CRC", { menuCode: "CRC", name: "Com rang rau", price: 200, base: { com_rang: 300, rau: 100 }, stock: {} }],
    ["CRMIX", { menuCode: "CRMix", name: "Com rang mix", price: 200, base: { com_rang: 300, rau: 100 }, stock: MIX_STOCK }],
    ["CRNEM", { menuCode: "CRNem", name: "Com rang nem", price: 200, base: { com_rang: 300, rau: 100 }, stock: { nem: 2 } }],
    ["NEM", { menuCode: "NEM", name: "Nem", price: 120, base: {}, stock: { nem: 2 } }],
    ["GX", { menuCode: "GCX", name: "Ga chien xu", price: 160, base: {}, stock: { ga_xu: 120 }, aliases: ["GCX"] }],
    ["BBAO", { menuCode: "BBAO", name: "Banh bao", price: 100, base: {}, stock: { banh_bao: 1 } }],
    ["BOH", { menuCode: "BOH", name: "Bo huc", price: 70, base: {}, stock: { bo_huc: 1 } }],
    ["CPV", { menuCode: "CPV", name: "Ca phe Viet", price: 50, base: {}, stock: { ca_phe_viet: 1 } }],
    ["P03", { menuCode: "P03", name: "Pepsi-Cola 0.33", price: 40, base: {}, stock: { p03: 1 } }],
    ["PBL", { menuCode: "PBL", name: "Pepsi Black 0.5", price: 45, base: {}, stock: { pbl: 1 } }],
    ["PCS33", { menuCode: "PCS33", name: "Pepsi Cream Soda 0.33", price: 45, base: {}, stock: { pcs33: 1 } }],
    ["PSC33", { menuCode: "PSC33", name: "Pepsi Strawberry Cream 0.33", price: 45, base: {}, stock: { psc33: 1 } }],
    ["PZ33", { menuCode: "PZ33", name: "Pepsi Zero Sugar 0.33", price: 40, base: {}, stock: { pz33: 1 } }],
    ["P50", { menuCode: "P50", name: "Pepsi-Cola 0.5", price: 45, base: {}, stock: { p50: 1 } }],
    ["PTR50", { menuCode: "PTR50", name: "Pepsi Tropical 0.5", price: 45, base: {}, stock: { ptr50: 1 } }],
    ["M7", { menuCode: "M7", name: "Mirinda / 7UP", price: 40, base: {}, stock: { soft_drink: 1 } }],
    ["WTR", { menuCode: "WTR", name: "Water", price: 35, base: {}, stock: { water: 1 } }],
    ["JCE", { menuCode: "JCE", name: "Juice", price: 50, base: {}, stock: { juice: 1 } }],
    ["JT50", { menuCode: "JT50", name: "Сок Садочок томатный 0.5", price: 46, base: {}, stock: { jt50: 1 } }],
    ["JAG50", { menuCode: "JAG50", name: "Сок Садочок яблочно-виноградный 0.5", price: 43, base: {}, stock: { jag50: 1 } }],
    ["JM50", { menuCode: "JM50", name: "Сок Садочок мультифрукт 0.5", price: 43, base: {}, stock: { jm50: 1 } }]
  ].forEach(([code, entry]) => addBase(BASE_PORTIONS, code, entry));

  Object.values(BASE_PORTIONS).forEach(base => {
    if (base.base?.pho === 300) {
      base.base.pho = PHO_PORTION;
    }

    if (base.stock?.bo === 100) {
      base.stock.bo = MEAT_PORTION;
    }
    if (base.stock?.ga === 100) {
      base.stock.ga = MEAT_PORTION;
    }
    if (base.stock?.heo === 100) {
      base.stock.heo = MEAT_PORTION;
    }
    if (base.stock?.nem === 2) {
      base.stock.nem = NEM_PORTION;
    }
  });

  const CODE_ALIASES = {};
  Object.values(BASE_PORTIONS).forEach(base => {
    CODE_ALIASES[base.code] = base.code;
    CODE_ALIASES[normalizeCode(base.menuCode)] = base.code;
    (base.aliases || []).forEach(alias => {
      CODE_ALIASES[normalizeCode(alias)] = base.code;
    });
  });

  function resolveBaseCode(code) {
    const normalized = normalizeCode(code);
    return CODE_ALIASES[normalized] || normalized;
  }

  function getBase(baseCode) {
    return BASE_PORTIONS[resolveBaseCode(baseCode)] || null;
  }

  function syncMenuMetadata() {
    const menu = global.menuData;
    if (!menu || typeof menu !== "object") return;

    for (const items of Object.values(menu)) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const canonical = resolveBaseCode(item.code);
        const base = BASE_PORTIONS[canonical];
        if (!base) continue;
        base.price = Number(item.price || base.price || 0);
        base.menuKey = item.key || base.menuKey || "";
        base.menuCode = normalizeCode(item.code || base.menuCode || base.code);
        base.name = item.translations?.ru || item.translations?.ua || item.translations?.vn || base.name;
      }
    }
  }

  function optionPrice(addon, value) {
    if (!addon) return 0;
    return Number(addon.price?.[String(value)] ?? addon.price?.[value] ?? 0);
  }

  function normalizeAddonSelection(selection) {
    if (!selection) return null;
    const code = normalizeCode(selection.code);
    const addon = ADDONS[code];
    if (!addon) return null;

    if (addon.allowedGrams) {
      const grams = Number(selection.grams || addon.defaultGrams || addon.allowedGrams[0] || 0);
      if (!addon.allowedGrams.includes(grams)) return null;
      return {
        code,
        name: addon.name,
        stockKey: addon.stockKey,
        grams,
        price: optionPrice(addon, grams)
      };
    }

    const qty = Number(selection.qty || addon.defaultQty || addon.allowedQty?.[0] || 0);
    if (!addon.allowedQty?.includes(qty)) return null;
    return {
      code,
      name: addon.name,
      stockKey: addon.stockKey,
      qty,
      price: optionPrice(addon, qty)
    };
  }

  function sortModifiers(modifiers) {
    const order = ["B", "G", "L", "T", "GX", "R", "NEM"];
    return [...modifiers].sort((left, right) => {
      const leftIndex = order.indexOf(left.code);
      const rightIndex = order.indexOf(right.code);
      return leftIndex - rightIndex;
    });
  }

  function modifierToken(modifier) {
    if (modifier.grams != null) return `${modifier.code}${modifier.grams}`;
    if (modifier.qty != null) return `${modifier.code}${modifier.qty}`;
    return modifier.code;
  }

  function modifierLabel(modifier) {
    if (!modifier) return "";
    if (modifier.code === "R") return `зелень ${modifier.grams}g`;
    if (modifier.code === "GX") return `курица в панировке ${modifier.grams}g`;
    if (modifier.code === "NEM") return `нем ${modifier.qty} шт`;
    if (modifier.grams != null) return `${modifier.name} ${modifier.grams}g`;
    if (modifier.qty != null) return `${modifier.name} ${modifier.qty}`;
    return modifier.name;
  }

  function modifierUsage(modifier) {
    if (!modifier) return {};
    if (modifier.grams != null) return { [modifier.stockKey]: Number(modifier.grams || 0) };
    if (modifier.qty != null) return { [modifier.stockKey]: Number(modifier.qty || 0) };
    return {};
  }

  function normalizeUsageInput(usage) {
    const normalized = {};
    for (const [key, value] of Object.entries(usage || {})) {
      const amount = Number(value || 0);
      if (!Number.isFinite(amount) || amount === 0) continue;
      normalized[key] = roundMetric(amount);
    }
    return normalized;
  }

  function buildOrderItem(baseCode, addons, qty = 1, note = "") {
    syncMenuMetadata();

    const base = getBase(baseCode);
    if (!base) {
      throw new Error(`Unknown base code: ${baseCode}`);
    }

    const units = Math.max(1, Number(qty || 1));
    const normalizedAddons = sortModifiers((Array.isArray(addons) ? addons : [])
      .map(normalizeAddonSelection)
      .filter(Boolean));

    const displayCode = [base.code, ...normalizedAddons.map(modifierToken)].join("+");
    const modifiersPrice = normalizedAddons.reduce((sum, modifier) => sum + Number(modifier.price || 0), 0);
    const unitPrice = roundMetric(Number(base.price || 0) + modifiersPrice);
    const total = roundMetric(unitPrice * units);
    const name = [base.name, ...normalizedAddons.map(modifierLabel)].filter(Boolean).join(" + ");
    const baseUsage = scaleUsage(base.base, units);
    const addonUsage = normalizedAddons.reduce((sum, modifier) => mergeUsage(sum, modifierUsage(modifier)), {});
    const stockUsage = mergeUsage(scaleUsage(base.stock, units), scaleUsage(addonUsage, units));

    return {
      key: displayCode,
      menu_key: base.menuKey || "",
      base_code: base.code,
      code: base.code,
      display_code: displayCode,
      name,
      qty: units,
      price: unitPrice,
      total,
      note: String(note || "").trim(),
      modifiers: normalizedAddons.map(modifier => {
        const payload = {
          code: modifier.code,
          name: modifier.name,
          stockKey: modifier.stockKey
        };
        if (modifier.grams != null) payload.grams = modifier.grams;
        if (modifier.qty != null) payload.qty = modifier.qty;
        return payload;
      }),
      base_usage: normalizeUsageInput(baseUsage),
      stock_usage: normalizeUsageInput(stockUsage),
      selections: {
        modifiers: normalizedAddons.map(modifier => ({ ...modifier }))
      }
    };
  }

  function parseModifierToken(token) {
    const raw = String(token || "").trim().toUpperCase();
    if (!raw) return null;

    if (/^NEM\d+$/.test(raw)) {
      return normalizeAddonSelection({ code: "NEM", qty: Number(raw.replace("NEM", "")) });
    }
    if (/^GX\d+$/.test(raw)) {
      return normalizeAddonSelection({ code: "GX", grams: Number(raw.replace("GX", "")) });
    }

    const match = raw.match(/^([BGLTR])(\d+)$/);
    if (!match) return null;
    return normalizeAddonSelection({
      code: match[1],
      grams: Number(match[2])
    });
  }

  function resolveItemCode(item) {
    const display = String(item?.display_code || "").trim();
    if (display) return display;
    return String(item?.code || "").trim();
  }

  function recoverItemDefinition(item) {
    const displayCode = resolveItemCode(item);
    if (!displayCode) return null;

    const tokens = displayCode.split("+").map(token => token.trim()).filter(Boolean);
    if (!tokens.length) return null;

    const base = getBase(tokens[0]);
    if (!base) return null;

    const explicitModifiers = Array.isArray(item?.modifiers) && item.modifiers.length
      ? item.modifiers.map(normalizeAddonSelection).filter(Boolean)
      : [];
    const parsedModifiers = explicitModifiers.length
      ? explicitModifiers
      : tokens.slice(1).map(parseModifierToken).filter(Boolean);

    return buildOrderItem(base.code, parsedModifiers, Math.max(1, Number(item?.qty || 1)), item?.note || "");
  }

  function getStockUsageFromOrderItem(item) {
    if (!item) {
      return { base: {}, stock: {}, total: {}, qty: 0, code: "" };
    }

    const baseUsage = normalizeUsageInput(item.base_usage || item.baseUsage || {});
    const stockUsage = normalizeUsageInput(item.stock_usage || item.stockUsage || {});
    const hasEmbeddedUsage = Object.keys(baseUsage).length || Object.keys(stockUsage).length;

    if (hasEmbeddedUsage) {
      return {
        code: resolveBaseCode(item.base_code || item.code),
        qty: Math.max(1, Number(item.qty || 1)),
        base: baseUsage,
        stock: stockUsage,
        total: mergeUsage(baseUsage, stockUsage)
      };
    }

    const rebuilt = recoverItemDefinition(item);
    if (!rebuilt) {
      return {
        code: resolveBaseCode(item.code),
        qty: Math.max(1, Number(item.qty || 1)),
        base: {},
        stock: {},
        total: {}
      };
    }

    return {
      code: rebuilt.code,
      qty: rebuilt.qty,
      base: normalizeUsageInput(rebuilt.base_usage),
      stock: normalizeUsageInput(rebuilt.stock_usage),
      total: mergeUsage(rebuilt.base_usage, rebuilt.stock_usage)
    };
  }

  function normalizeStatus(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (!raw) return "NEW";
    if (raw === "COMPLETED" || raw === "DONE") return "HANDED";
    if (raw === "CONFIRMED") return "COOKING";
    if (raw === "SENT" || raw === "FAILED") return "NEW";
    return raw;
  }

  function orderValues(orders) {
    if (Array.isArray(orders)) return orders;
    if (orders && typeof orders === "object") return Object.values(orders);
    return [];
  }

  function getStockUsageFromOrders(orders) {
    const summary = {
      stock: {},
      base: {},
      total: {},
      orderCount: 0,
      itemCount: 0
    };

    for (const order of orderValues(orders)) {
      if (normalizeStatus(order?.status) === "CANCELLED") continue;
      summary.orderCount += 1;
      for (const item of order?.items || []) {
        const usage = getStockUsageFromOrderItem(item);
        summary.itemCount += 1;
        summary.stock = mergeUsage(summary.stock, usage.stock);
        summary.base = mergeUsage(summary.base, usage.base);
        summary.total = mergeUsage(summary.total, usage.total);
      }
    }

    return summary;
  }

  function findStockEntry(summary, key) {
    if (!summary) return null;
    const stock = summary.stock || summary;
    return stock?.[key] || null;
  }

  function estimateBasePortionsLeft(baseCode, stockSummary) {
    const base = getBase(baseCode);
    if (!base) return null;

    const requirements = mergeUsage(base.base, base.stock);
    const candidates = [];

    for (const [key, amount] of Object.entries(requirements)) {
      if (!amount) continue;
      const entry = findStockEntry(stockSummary, key);
      if (!entry) continue;
      const remaining = Number(entry.remaining ?? 0);
      candidates.push({
        key,
        label: STOCK_ITEMS[key]?.name || key,
        remaining,
        amount,
        portionsLeft: roundMetric(remaining / amount)
      });
    }

    if (!candidates.length) return null;

    candidates.sort((left, right) => left.portionsLeft - right.portionsLeft);
    const limiting = candidates[0];
    let tone = "ok";
    if (limiting.portionsLeft <= 0) tone = "danger";
    else if (limiting.portionsLeft < 3) tone = "danger";
    else if (limiting.portionsLeft < 10) tone = "warn";

    return {
      baseCode: base.code,
      portionsLeft: limiting.portionsLeft,
      limitingStockKey: limiting.key,
      limitingLabel: limiting.label,
      tone,
      components: candidates
    };
  }

  function inferStockKeyFromItemText(text) {
    const haystack = normalizeLookup(text);
    for (const stock of Object.values(STOCK_ITEMS)) {
      if ((stock.aliases || []).some(alias => haystack.includes(normalizeLookup(alias)))) {
        return stock.key;
      }
    }
    return "";
  }

  syncMenuMetadata();

  global.DRAGON_MODIFIERS = {
    STOCK_ITEMS,
    BASE_PORTIONS,
    ADDONS,
    resolveBaseCode,
    getBase,
    buildOrderItem,
    getStockUsageFromOrderItem,
    getStockUsageFromOrders,
    estimateBasePortionsLeft,
    inferStockKeyFromItemText
  };
})(window);
