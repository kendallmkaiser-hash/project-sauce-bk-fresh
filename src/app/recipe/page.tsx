"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import recipes from "../../../data/recipes.json";
import deals from "../../../data/deals.json";
import stores from "../../../data/stores.json";

const StoreMap = dynamic(() => import("@/components/StoreMap"), { ssr: false });

interface IngredientMatch {
  ingredientName: string;
  amount: string;
  bestDeal: {
    storeName: string;
    storeId: string;
    dealTitle: string;
    price: number;
    unit: string;
    originalPrice: number | null;
  } | null;
  alternativeDeals: {
    storeName: string;
    storeId: string;
    dealTitle: string;
    price: number;
    unit: string;
  }[];
}

export default function RecipePage() {
  const recipe = recipes.find((r) => r.featured);

  const ingredientMatches: IngredientMatch[] = useMemo(() => {
    if (!recipe) return [];

    return recipe.ingredients.map((ingredient) => {
      const matchingDeals = deals.filter((deal) =>
        ingredient.searchTerms.some(
          (term) =>
            deal.tags.some((tag) => tag.includes(term) || term.includes(tag)) ||
            deal.title.toLowerCase().includes(term) ||
            deal.description.toLowerCase().includes(term)
        )
      );

      const sortedDeals = [...matchingDeals].sort((a, b) => a.price - b.price);

      const bestDeal = sortedDeals[0]
        ? {
            storeName: sortedDeals[0].storeName,
            storeId: sortedDeals[0].storeId,
            dealTitle: sortedDeals[0].title,
            price: sortedDeals[0].price,
            unit: sortedDeals[0].unit,
            originalPrice: sortedDeals[0].originalPrice,
          }
        : null;

      const alternativeDeals = sortedDeals.slice(1, 3).map((d) => ({
        storeName: d.storeName,
        storeId: d.storeId,
        dealTitle: d.title,
        price: d.price,
        unit: d.unit,
      }));

      return {
        ingredientName: ingredient.name,
        amount: ingredient.amount,
        bestDeal,
        alternativeDeals,
      };
    });
  }, [recipe]);

  const totalEstimatedCost = ingredientMatches.reduce(
    (sum, match) => sum + (match.bestDeal?.price || 0),
    0
  );

  const recommendedStoreIds = [
    ...new Set(
      ingredientMatches
        .filter((m) => m.bestDeal)
        .map((m) => m.bestDeal!.storeId)
    ),
  ];
  const recommendedStores = stores.filter((s) =>
    recommendedStoreIds.includes(s.id)
  );

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 text-lg">
          No recipe featured this week. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Recipe Header */}
      <div className="mb-8">
        <span className="deal-badge bg-[var(--ps-orange)] text-white">
          Recipe of the Week
        </span>
        <h1 className="text-3xl font-bold mt-3">{recipe.title}</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">{recipe.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span>Serves {recipe.servings}</span>
          <span>Prep: {recipe.prepTime}</span>
          <span>Cook: {recipe.cookTime}</span>
          <span>{recipe.difficulty}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Best Prices Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Where to Buy - Best Prices</h2>
              <div className="text-right">
                <div className="text-sm text-gray-500">Estimated Total</div>
                <div className="text-2xl font-bold text-[var(--ps-red)]">
                  ${totalEstimatedCost.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {ingredientMatches.map((match, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{match.ingredientName}</div>
                      <div className="text-sm text-gray-500">
                        {match.amount}
                      </div>
                    </div>
                    {match.bestDeal ? (
                      <div className="text-right">
                        <div className="font-bold text-[var(--ps-red)]">
                          ${match.bestDeal.price.toFixed(2)}{" "}
                          <span className="text-xs font-normal text-gray-500">
                            {match.bestDeal.unit}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          at{" "}
                          <span className="font-medium">
                            {match.bestDeal.storeName}
                          </span>
                        </div>
                        {match.bestDeal.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            Was ${match.bestDeal.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No deals found - check local stores
                      </div>
                    )}
                  </div>

                  {match.alternativeDeals.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Also available at:
                      </div>
                      <div className="flex gap-3">
                        {match.alternativeDeals.map((alt, j) => (
                          <span key={j} className="text-xs text-gray-600">
                            {alt.storeName} - ${alt.price.toFixed(2)}{" "}
                            {alt.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 bg-[var(--ps-red)] text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="bg-[var(--ps-cream)] rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3">Budget Tips</h2>
              <ul className="space-y-2">
                {recipe.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-[var(--ps-orange)] shrink-0">
                      *
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shopping Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold mb-3">Shopping Summary</h3>
            <p className="text-sm text-gray-600 mb-4">
              Visit these {recommendedStores.length} store
              {recommendedStores.length !== 1 ? "s" : ""} to get the best prices
              on all ingredients:
            </p>
            <div className="space-y-2 mb-4">
              {recommendedStores.map((store) => {
                const storeIngredients = ingredientMatches.filter(
                  (m) => m.bestDeal?.storeId === store.id
                );
                return (
                  <div
                    key={store.id}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <div className="font-medium text-sm">{store.name}</div>
                    <div className="text-xs text-gray-500">{store.address}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {storeIngredients
                        .map((m) => m.ingredientName)
                        .join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Estimated Total</span>
                <span className="font-bold text-[var(--ps-red)]">
                  ${totalEstimatedCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost per Serving</span>
                <span className="font-medium">
                  ${(totalEstimatedCost / recipe.servings).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Map showing recommended stores */}
          {recommendedStores.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Recommended Stores</h3>
              <StoreMap stores={recommendedStores} height="300px" scrollZoom={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
