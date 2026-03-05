"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import stores from "../../../data/stores.json";
import deals from "../../../data/deals.json";

const StoreMap = dynamic(() => import("@/components/StoreMap"), { ssr: false });

const affordabilityInfo = (level: number) => {
  if (level === 1)
    return { text: "$", color: "text-green-700", bg: "bg-green-100", label: "Very Affordable" };
  if (level === 2)
    return { text: "$$", color: "text-yellow-700", bg: "bg-yellow-100", label: "Moderate" };
  return { text: "$$$", color: "text-orange-700", bg: "bg-orange-100", label: "Pricier" };
};

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterAffordability, setFilterAffordability] = useState("");

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (filterType && store.type !== filterType) return false;
      if (
        filterAffordability &&
        store.affordability !== Number(filterAffordability)
      )
        return false;
      return true;
    });
  }, [filterType, filterAffordability]);

  const storeTypes = [...new Set(stores.map((s) => s.type))];

  const selectedStoreData = stores.find((s) => s.id === selectedStore);
  const storeDeals = selectedStore
    ? deals.filter((d) => d.storeId === selectedStore)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Downtown Brooklyn Store Map</h1>
      <p className="text-gray-600 mb-6">
        Find affordable grocery stores near you. Click a pin for details and
        current deals.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Store Types</option>
          {storeTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterAffordability}
          onChange={(e) => setFilterAffordability(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Price Levels</option>
          <option value="1">$ - Very Affordable</option>
          <option value="2">$$ - Moderate</option>
          <option value="3">$$$ - Pricier</option>
        </select>
        <div className="flex items-center gap-4 text-xs text-gray-500 ml-auto">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#2D6A4F] inline-block" />{" "}
            $ Very Affordable
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#E9C46A] inline-block" />{" "}
            $$ Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#E76F51] inline-block" />{" "}
            $$$ Pricier
          </span>
        </div>
      </div>

      {/* Map */}
      <StoreMap
        stores={filteredStores}
        selectedStore={selectedStore}
        onStoreSelect={setSelectedStore}
      />

      {/* Selected store details */}
      {selectedStoreData && (
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedStoreData.name}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedStoreData.address}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {selectedStoreData.hours}
              </p>
            </div>
            {(() => {
              const aff = affordabilityInfo(selectedStoreData.affordability);
              return (
                <span className={`deal-badge ${aff.bg} ${aff.color}`}>
                  {aff.label}
                </span>
              );
            })()}
          </div>
          <p className="text-gray-700 mt-3">{selectedStoreData.description}</p>

          {storeDeals.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-semibold mb-3">
                Current Deals ({storeDeals.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storeDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-sm">{deal.title}</div>
                      <div className="text-xs text-gray-500">
                        {deal.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-bold text-[var(--ps-red)]">
                        ${deal.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{deal.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Store List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          All Stores ({filteredStores.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => {
            const aff = affordabilityInfo(store.affordability);
            const count = deals.filter((d) => d.storeId === store.id).length;
            return (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`text-left bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  selectedStore === store.id
                    ? "border-[var(--ps-red)] shadow-md"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{store.name}</h3>
                  <span className={`deal-badge ${aff.bg} ${aff.color}`}>
                    {aff.text}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {store.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {count > 0 && (
                  <p className="text-xs text-[var(--ps-red)] font-medium mt-2">
                    {count} active deal{count > 1 ? "s" : ""}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
