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
          const savingsA = a.originalPrice
            ? (a.originalPrice - a.price) / a.originalPrice
            : 0;
          const savingsB = b.originalPrice
            ? (b.originalPrice - b.price) / b.originalPrice
            : 0;
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
      <p className="text-gray-600 mb-6">
        Search and compare {deals.length} deals across Downtown Brooklyn stores.
        Updated weekly.
      </p>

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
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
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
