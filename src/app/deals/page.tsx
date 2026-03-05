"use client";

import { useState, useMemo } from "react";
import DealCard from "@/components/DealCard";
import SearchFilter from "@/components/SearchFilter";
import deals from "../../../data/deals.json";

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("savings");

  const categories = [...new Set(deals.map((d) => d.category))];
  const types = [...new Set(deals.map((d) => d.type))];

  // Compute price stats per category for comparison
  const categoryStats = useMemo(() => {
    const stats: Record<string, { min: number; avg: number; minId: string }> = {};
    const groups: Record<string, { prices: number[]; ids: string[] }> = {};
    deals.forEach((deal) => {
      if (!groups[deal.category]) groups[deal.category] = { prices: [], ids: [] };
      groups[deal.category].prices.push(deal.price);
      groups[deal.category].ids.push(deal.id);
    });
    for (const [cat, group] of Object.entries(groups)) {
      const min = Math.min(...group.prices);
      const avg = group.prices.reduce((a, b) => a + b, 0) / group.prices.length;
      const minIdx = group.prices.indexOf(min);
      stats[cat] = { min, avg, minId: group.ids[minIdx] };
    }
    return stats;
  }, []);

  const filteredDeals = useMemo(() => {
    let result = deals.filter((deal) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        deal.title.toLowerCase().includes(query) ||
        deal.description.toLowerCase().includes(query) ||
        deal.storeName.toLowerCase().includes(query) ||
        deal.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesCategory =
        !selectedCategory || deal.category === selectedCategory;
      const matchesType = !selectedType || deal.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "savings": {
          const avgA = categoryStats[a.category]?.avg || a.price;
          const avgB = categoryStats[b.category]?.avg || b.price;
          const savingsA = a.originalPrice
            ? (a.originalPrice - a.price) / a.originalPrice
            : avgA > a.price ? (avgA - a.price) / avgA : 0;
          const savingsB = b.originalPrice
            ? (b.originalPrice - b.price) / b.originalPrice
            : avgB > b.price ? (avgB - b.price) / avgB : 0;
          return savingsB - savingsA;
        }
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, selectedCategory, selectedType, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Grocery Deals</h1>
      <p className="text-gray-600 mb-4">
        Compare {deals.length} items from weekly store flyers across Downtown Brooklyn.
        Updated every Monday.
      </p>
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
        <strong>How to read this page:</strong> Prices are from store weekly flyers — what stores are actively promoting right now.
        Crossed-out prices show the average across all tracked stores so you can see which store has the best deal.
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        categories={categories}
        types={types}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {filteredDeals.length} of {deals.length} deals
        </p>
        {(searchQuery || selectedCategory || selectedType) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedType("");
            }}
            className="text-sm text-[var(--ps-orange)] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeals.map((deal) => {
            const stats = categoryStats[deal.category];
            return (
              <DealCard
                key={deal.id}
                deal={deal}
                isLowestPrice={stats?.minId === deal.id}
                avgPrice={stats?.avg && stats.avg > deal.price ? stats.avg : null}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No deals found matching your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedType("");
            }}
            className="mt-4 text-[var(--ps-green)] font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
