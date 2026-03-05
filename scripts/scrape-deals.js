#!/usr/bin/env node

/**
 * Deal scraper for Project Sauce
 *
 * This script scrapes grocery deals from public flyer/deal aggregator sites
 * and store websites for Downtown Brooklyn stores.
 *
 * Data sources (all free, public data):
 * - Store weekly circulars (public web pages)
 * - Flipp.com (digital flyer aggregator)
 *
 * Usage: node scripts/scrape-deals.js
 * Run via GitHub Actions on a weekly schedule (see .github/workflows/scrape.yml)
 */

const fs = require("fs");
const path = require("path");

const STORES_PATH = path.join(__dirname, "..", "data", "stores.json");
const DEALS_PATH = path.join(__dirname, "..", "data", "deals.json");

const stores = JSON.parse(fs.readFileSync(STORES_PATH, "utf-8"));

// Flipp API is publicly accessible and returns weekly flyer data
const FLIPP_SEARCH_URL = "https://backflipp.wishabi.com/flipp/items/search";

async function searchFlipp(query, postalCode = "11201") {
  const url = `${FLIPP_SEARCH_URL}?locale=en-us&postal_code=${postalCode}&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Flipp search failed for "${query}":`, error.message);
    return [];
  }
}

// Map Flipp merchant names to our store IDs
const MERCHANT_MAP = {
  aldi: "aldi-downtown",
  lidl: null, // Lidl not in our tracked stores
  "key food": "keyfood-fulton",
  target: "target-atlantic",
  "trader joe": "trader-joes-atlantic",
  foodtown: "foodtown-myrtle",
  "c town": "ctownsupermarket-dekalb",
  "c-town": "ctownsupermarket-dekalb",
  "ctown": "ctownsupermarket-dekalb",
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

function categorizeItem(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  if (
    text.match(
      /chicken|beef|pork|meat|turkey|sausage|bacon|steak|ground|drumstick/
    )
  )
    return "meat";
  if (
    text.match(
      /apple|banana|lettuce|tomato|onion|potato|avocado|broccoli|fruit|vegetable|produce|berry|mango/
    )
  )
    return "produce";
  if (text.match(/milk|cheese|yogurt|butter|egg|cream|dairy/)) return "dairy";
  if (text.match(/bread|tortilla|bun|roll|bagel|bakery/)) return "bakery";
  if (text.match(/can|canned|soup|bean|tuna/)) return "canned";
  if (text.match(/frozen|ice cream|pizza/)) return "frozen";
  if (text.match(/cereal|pasta|rice|flour|sugar|oil|sauce|spice/))
    return "pantry";
  if (text.match(/chip|snack|cookie|cracker|candy/)) return "snacks";
  if (text.match(/soda|juice|water|drink|coffee|tea/)) return "beverages";
  return "other";
}

function extractTags(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  const tags = [];
  const keywords = [
    "chicken",
    "beef",
    "pork",
    "rice",
    "pasta",
    "bread",
    "milk",
    "eggs",
    "cheese",
    "butter",
    "onion",
    "tomato",
    "potato",
    "banana",
    "apple",
    "beans",
    "cereal",
    "frozen",
    "organic",
    "produce",
    "meat",
    "fruit",
    "vegetables",
    "snacks",
    "canned",
    "oil",
    "sugar",
    "flour",
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
  if (raw === "for") return "each";
  if (!raw) return "each";
  return "each";
}

function classifyDealType(item) {
  const story = (item.saleStory || "").toLowerCase();
  const pre = (item.prePriceText || "").toLowerCase();

  // Has explicit savings info
  if (item.originalPrice && item.originalPrice > item.price) return "weekly-sale";
  if (story.includes("save")) return "weekly-sale";
  if (story.includes("buy") && story.includes("get")) return "coupon";
  if (story.includes("bogo") || story.includes("b1g1")) return "coupon";
  if (pre.includes("sale")) return "weekly-sale";
  if (pre.includes("coupon") || pre.includes("clip")) return "coupon";
  if (story.includes("meal") || story.includes("dinner")) return "meal-deal";

  // All flyer items are inherently weekly promotions
  return "weekly-sale";
}

async function scrapeDeals() {
  console.log("Starting deal scrape for Downtown Brooklyn (11201)...\n");

  // Common grocery search terms
  const searchTerms = [
    "chicken",
    "beef",
    "pork",
    "rice",
    "pasta",
    "eggs",
    "milk",
    "bread",
    "produce",
    "vegetables",
    "fruit",
    "cereal",
    "canned",
    "frozen",
    "snacks",
    "oil",
    "beans",
    "cheese",
  ];

  const allItems = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    console.log(`Searching for "${term}"...`);
    const items = await searchFlipp(term);
    console.log(`  Found ${items.length} results`);

    for (const item of items) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const storeId = matchMerchant(item.merchant_name || item.merchant || "");
      if (!storeId) continue;

      const store = stores.find((s) => s.id === storeId);
      if (!store) continue;

      allItems.push({
        flippId: item.id,
        storeId,
        storeName: store.name,
        name: item.name || "",
        description: item.description || "",
        price: item.current_price || item.price || 0,
        originalPrice: item.original_price || null,
        saleStory: item.sale_story || null,
        prePriceText: item.pre_price_text || null,
        postPriceText: item.post_price_text || null,
        validFrom: item.valid_from || new Date().toISOString().split("T")[0],
        validTo:
          item.valid_to ||
          new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      });
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nMatched ${allItems.length} deals to tracked stores.`);

  // Filter out items with no price or no name
  const validItems = allItems.filter(
    (item) => item.price > 0 && item.name && item.name.trim() !== ""
  );
  console.log(`After filtering invalid items: ${validItems.length} deals remain.`);

  // Convert to our deal format
  const now = new Date().toISOString().split("T")[0];
  const deals = validItems.map((item, i) => ({
    id: `deal-scraped-${i + 1}`,
    storeId: item.storeId,
    storeName: item.storeName,
    title: item.name,
    description: item.saleStory
      ? item.saleStory
      : item.description || "",
    price: item.price,
    unit: normalizeUnit(item.postPriceText),
    originalPrice:
      item.originalPrice && item.originalPrice > item.price
        ? item.originalPrice
        : null,
    category: categorizeItem(item.name, item.description),
    type: classifyDealType(item),
    validFrom: item.validFrom,
    validTo: item.validTo,
    tags: extractTags(item.name, item.description),
  }));

  if (deals.length > 0) {
    fs.writeFileSync(DEALS_PATH, JSON.stringify(deals, null, 2));
    console.log(`\nWrote ${deals.length} deals to ${DEALS_PATH}`);
  } else {
    console.log(
      "\nNo scraped deals found. Keeping existing deals.json as-is."
    );
    console.log(
      "This is normal if the Flipp API is rate-limited or stores have no active flyers."
    );
    console.log("You can manually update data/deals.json with current deals.");
  }
}

scrapeDeals().catch(console.error);
