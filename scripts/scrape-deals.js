#!/usr/bin/env node

/**
 * Deal scraper for Project Sauce
 *
 * Data sources (all free, public data):
 * 1. Flipp.com — weekly store flyer/circular items
 * 2. Target Circle — daily rotating deals from Target's public API
 * 3. Stop & Shop — digital coupons from their public coupon API
 *
 * Runs daily via GitHub Actions (see .github/workflows/scrape.yml)
 */

const fs = require("fs");
const path = require("path");

const STORES_PATH = path.join(__dirname, "..", "data", "stores.json");
const DEALS_PATH = path.join(__dirname, "..", "data", "deals.json");

const stores = JSON.parse(fs.readFileSync(STORES_PATH, "utf-8"));

// ─── Shared utilities ───

function categorizeItem(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  if (text.match(/chicken|beef|pork|meat|turkey|sausage|bacon|steak|ground|drumstick/)) return "meat";
  if (text.match(/apple|banana|lettuce|tomato|onion|potato|avocado|broccoli|fruit|vegetable|produce|berry|mango/)) return "produce";
  if (text.match(/milk|cheese|yogurt|butter|egg|cream|dairy/)) return "dairy";
  if (text.match(/bread|tortilla|bun|roll|bagel|bakery/)) return "bakery";
  if (text.match(/can|canned|soup|bean|tuna/)) return "canned";
  if (text.match(/frozen|ice cream|pizza/)) return "frozen";
  if (text.match(/cereal|pasta|rice|flour|sugar|oil|sauce|spice/)) return "pantry";
  if (text.match(/chip|snack|cookie|cracker|candy/)) return "snacks";
  if (text.match(/soda|juice|water|drink|coffee|tea/)) return "beverages";
  return "other";
}

function extractTags(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  const tags = [];
  const keywords = [
    "chicken", "beef", "pork", "rice", "pasta", "bread", "milk", "eggs",
    "cheese", "butter", "onion", "tomato", "potato", "banana", "apple",
    "beans", "cereal", "frozen", "organic", "produce", "meat", "fruit",
    "vegetables", "snacks", "canned", "oil", "sugar", "flour",
  ];
  for (const kw of keywords) {
    if (text.includes(kw)) tags.push(kw);
  }
  return tags.slice(0, 5);
}

function normalizeUnit(postPriceText) {
  if (!postPriceText) return "each";
  const raw = postPriceText.replace(/^\//, "").trim().toLowerCase();
  if (raw.includes("lb")) return "per lb";
  if (raw.includes("oz")) return "per oz";
  if (raw.includes("ea")) return "each";
  if (!raw || raw === "for") return "each";
  return "each";
}

function estimateOriginalPrice(item) {
  if (item.originalPrice && item.originalPrice > item.price) return item.originalPrice;
  const story = item.saleStory || "";
  const dollarMatch = story.match(/save\s*\$(\d+(?:\.\d{1,2})?)/i);
  if (dollarMatch) {
    const savings = parseFloat(dollarMatch[1]);
    if (savings > 0 && savings < item.price * 3) return Math.round((item.price + savings) * 100) / 100;
  }
  const centMatch = story.match(/save\s*(\d+)\s*[¢c]/i);
  if (centMatch) {
    const savings = parseInt(centMatch[1]) / 100;
    if (savings > 0) return Math.round((item.price + savings) * 100) / 100;
  }
  const pctMatch = story.match(/save\s*(?:up\s*to\s*)?(\d+)\s*%/i);
  if (pctMatch) {
    const pct = parseInt(pctMatch[1]);
    if (pct > 0 && pct < 90) return Math.round((item.price / (1 - pct / 100)) * 100) / 100;
  }
  return null;
}

// ─── Source 1: Flipp (weekly flyers) ───

const FLIPP_SEARCH_URL = "https://backflipp.wishabi.com/flipp/items/search";

const MERCHANT_MAP = {
  aldi: "aldi-downtown",
  lidl: null,
  "key food": "keyfood-fulton",
  target: "target-atlantic",
  "trader joe": "trader-joes-atlantic",
  foodtown: "foodtown-myrtle",
  "c town": "ctownsupermarket-dekalb",
  "c-town": "ctownsupermarket-dekalb",
  ctown: "ctownsupermarket-dekalb",
  "stop & shop": "stop-and-shop-atlantic",
  "stop and shop": "stop-and-shop-atlantic",
  "family dollar": "family-dollar-myrtle",
  "dollar tree": "dollar-tree-fulton",
  associated: "associated-fulton",
  pioneer: "pioneer-columbus",
  bravo: "bravo-livingston",
};

function matchMerchant(merchantName) {
  const lower = merchantName.toLowerCase();
  for (const [key, storeId] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) return storeId;
  }
  return null;
}

async function scrapeFlipp() {
  console.log("── Flipp (weekly flyers) ──");
  const searchTerms = [
    "chicken", "beef", "pork", "rice", "pasta", "eggs", "milk", "bread",
    "produce", "vegetables", "fruit", "cereal", "canned", "frozen",
    "snacks", "oil", "beans", "cheese", "yogurt", "butter", "juice",
    "coffee", "soup", "fish", "shrimp",
  ];

  const allItems = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    try {
      const url = `${FLIPP_SEARCH_URL}?locale=en-us&postal_code=11201&q=${encodeURIComponent(term)}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const items = data.items || [];
      console.log(`  "${term}": ${items.length} results`);

      for (const item of items) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);

        const storeId = matchMerchant(item.merchant_name || "");
        if (!storeId) continue;

        const store = stores.find((s) => s.id === storeId);
        if (!store) continue;

        const price = item.current_price || 0;
        const name = item.name || "";
        if (!price || !name.trim()) continue;

        allItems.push({
          storeId,
          storeName: store.name,
          title: name,
          description: item.sale_story || "",
          price,
          unit: normalizeUnit(item.post_price_text),
          originalPrice: item.original_price || null,
          saleStory: item.sale_story || null,
          category: categorizeItem(name, item.description || ""),
          type: "weekly-flyer",
          source: "flipp",
          validFrom: item.valid_from || new Date().toISOString().split("T")[0],
          validTo: item.valid_to || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          tags: extractTags(name, item.description || ""),
        });
      }
    } catch (err) {
      console.error(`  Flipp error for "${term}":`, err.message);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`  Total from Flipp: ${allItems.length}\n`);
  return allItems;
}

// ─── Source 2: Target Circle deals ───

async function scrapeTargetCircle() {
  console.log("── Target Circle (daily deals) ──");
  const deals = [];

  // Target's public redsky API for store deals
  // Store ID 1347 = Atlantic Terminal Brooklyn
  const targetStoreId = "1347";
  const searchTerms = ["grocery", "food", "snacks", "beverages", "dairy", "meat", "produce"];

  for (const term of searchTerms) {
    try {
      const url = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&channel=WEB&count=24&keyword=${encodeURIComponent(term)}&offset=0&page=%2Fs%2F${encodeURIComponent(term)}&pricing_store_id=${targetStoreId}&scheduled_delivery_store_id=${targetStoreId}&store_ids=${targetStoreId}&visitor_id=guest&category=5xt1a`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ProjectSauce/1.0)",
        },
      });

      if (!response.ok) {
        console.log(`  "${term}": HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const products = data?.data?.search?.products || [];
      console.log(`  "${term}": ${products.length} products`);

      for (const product of products) {
        const item = product?.item || {};
        const price = product?.price?.current_retail || product?.price?.reg_retail || 0;
        const regPrice = product?.price?.reg_retail || null;
        const title = item.product_description?.title || "";
        if (!price || !title) continue;

        const hasDiscount = regPrice && regPrice > price;
        const promoMsg = product?.price?.save_message || product?.promotions?.[0]?.plp_message || "";

        deals.push({
          storeId: "target-atlantic",
          storeName: "Target",
          title: title.replace(/<[^>]*>/g, "").substring(0, 100),
          description: promoMsg || (hasDiscount ? `Was $${regPrice.toFixed(2)}` : ""),
          price,
          unit: "each",
          originalPrice: hasDiscount ? regPrice : null,
          saleStory: promoMsg,
          category: categorizeItem(title, ""),
          type: hasDiscount ? "daily-deal" : promoMsg ? "coupon" : "everyday-low",
          source: "target-circle",
          validFrom: new Date().toISOString().split("T")[0],
          validTo: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
          tags: extractTags(title, ""),
        });
      }
    } catch (err) {
      console.log(`  Target error for "${term}":`, err.message);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`  Total from Target Circle: ${deals.length}\n`);
  return deals;
}

// ─── Source 3: Stop & Shop digital coupons ───

async function scrapeStopAndShop() {
  console.log("── Stop & Shop (digital coupons) ──");
  const deals = [];

  try {
    // Stop & Shop's public coupon/deal pages
    const url = "https://stopandshop.com/apis/storemode/circular/items?storeId=0630&type=2";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProjectSauce/1.0)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.log(`  HTTP ${response.status} — trying alternate source`);

      // Fallback: scrape their weekly ad page for deal data
      const altUrl = "https://stopandshop.com/apis/storemode/circular/categories?storeId=0630&type=1";
      const altResponse = await fetch(altUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ProjectSauce/1.0)",
          Accept: "application/json",
        },
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        const categories = altData?.categories || altData || [];
        console.log(`  Found ${Array.isArray(categories) ? categories.length : 0} categories from alternate source`);
      } else {
        console.log(`  Alternate source also returned ${altResponse.status}`);
      }
    } else {
      const data = await response.json();
      const items = data?.items || data || [];
      console.log(`  Found ${Array.isArray(items) ? items.length : 0} items`);

      if (Array.isArray(items)) {
        for (const item of items) {
          const title = item.title || item.name || item.description || "";
          const price = parseFloat(item.price || item.current_price || 0);
          if (!title || !price) continue;

          deals.push({
            storeId: "stop-and-shop-atlantic",
            storeName: "Stop & Shop",
            title: title.substring(0, 100),
            description: item.savings_text || item.offer_text || "",
            price,
            unit: "each",
            originalPrice: item.was_price ? parseFloat(item.was_price) : null,
            saleStory: item.savings_text || null,
            category: categorizeItem(title, ""),
            type: "coupon",
            source: "stop-and-shop",
            validFrom: item.start_date || new Date().toISOString().split("T")[0],
            validTo: item.end_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
            tags: extractTags(title, ""),
          });
        }
      }
    }
  } catch (err) {
    console.log(`  Stop & Shop error:`, err.message);
  }

  console.log(`  Total from Stop & Shop: ${deals.length}\n`);
  return deals;
}

// ─── Main ───

async function scrapeAll() {
  console.log("Project Sauce Daily Deal Scrape");
  console.log(`Date: ${new Date().toISOString().split("T")[0]}`);
  console.log(`ZIP: 11201 (Downtown Brooklyn)\n`);

  // Run all scrapers
  const [flippDeals, targetDeals, stopShopDeals] = await Promise.all([
    scrapeFlipp(),
    scrapeTargetCircle(),
    scrapeStopAndShop(),
  ]);

  // Combine all sources
  const allDeals = [...flippDeals, ...targetDeals, ...stopShopDeals];

  // Deduplicate by similar title + store
  const seen = new Set();
  const dedupedDeals = allDeals.filter((deal) => {
    const key = `${deal.storeId}:${deal.title.toLowerCase().substring(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Process final deals
  const finalDeals = dedupedDeals.map((deal, i) => ({
    id: `deal-${deal.source}-${i + 1}`,
    storeId: deal.storeId,
    storeName: deal.storeName,
    title: deal.title,
    description: deal.description,
    price: deal.price,
    unit: deal.unit,
    originalPrice: estimateOriginalPrice(deal),
    category: deal.category,
    type: deal.type,
    source: deal.source,
    validFrom: deal.validFrom,
    validTo: deal.validTo,
    tags: deal.tags,
  }));

  console.log("── Summary ──");
  console.log(`  Flipp:         ${flippDeals.length} deals`);
  console.log(`  Target Circle: ${targetDeals.length} deals`);
  console.log(`  Stop & Shop:   ${stopShopDeals.length} deals`);
  console.log(`  After dedup:   ${finalDeals.length} deals`);

  // Source breakdown
  const bySource = {};
  finalDeals.forEach((d) => {
    bySource[d.source] = (bySource[d.source] || 0) + 1;
  });
  console.log(`  By source:`, bySource);

  // Type breakdown
  const byType = {};
  finalDeals.forEach((d) => {
    byType[d.type] = (byType[d.type] || 0) + 1;
  });
  console.log(`  By type:`, byType);

  if (finalDeals.length > 0) {
    fs.writeFileSync(DEALS_PATH, JSON.stringify(finalDeals, null, 2));
    console.log(`\nWrote ${finalDeals.length} deals to ${DEALS_PATH}`);
  } else {
    console.log("\nNo deals scraped. Keeping existing deals.json.");
  }
}

scrapeAll().catch(console.error);
