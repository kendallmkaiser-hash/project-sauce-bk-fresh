"use client";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  categories: string[];
  types: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  categories,
  types,
  sortBy,
  onSortChange,
}: SearchFilterProps) {
  const typeLabels: Record<string, string> = {
    "weekly-flyer": "Weekly Flyer",
    "weekly-sale": "Weekly Flyer",
    "everyday-low": "Everyday Low",
    coupon: "Coupon",
    "meal-deal": "Meal Deal",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by ingredient, store, or product..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ps-green)] focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ps-green)]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ps-green)]"
        >
          <option value="">All Deal Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type] || type}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ps-green)]"
        >
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="savings">Best Value</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
