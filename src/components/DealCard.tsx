interface Deal {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  originalPrice: number | null;
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
  tags: string[];
}

const typeColors: Record<string, { bg: string; text: string }> = {
  "weekly-sale": { bg: "bg-green-100", text: "text-green-800" },
  "everyday-low": { bg: "bg-blue-100", text: "text-blue-800" },
  coupon: { bg: "bg-purple-100", text: "text-purple-800" },
  "meal-deal": { bg: "bg-orange-100", text: "text-orange-800" },
};

const typeLabels: Record<string, string> = {
  "weekly-sale": "Weekly Sale",
  "everyday-low": "Everyday Low",
  coupon: "Coupon",
  "meal-deal": "Meal Deal",
};

export default function DealCard({ deal }: { deal: Deal }) {
  const colors = typeColors[deal.type] || typeColors["weekly-sale"];
  const savings =
    deal.originalPrice && deal.originalPrice > deal.price
      ? ((1 - deal.price / deal.originalPrice) * 100).toFixed(0)
      : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`deal-badge ${colors.bg} ${colors.text}`}
            >
              {typeLabels[deal.type] || deal.type}
            </span>
            <span className="text-xs text-gray-500">{deal.storeName}</span>
          </div>
          <h3 className="font-semibold text-lg">{deal.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
        </div>
        <div className="text-right ml-4 shrink-0">
          <div className="text-2xl font-bold text-[var(--ps-green)]">
            ${deal.price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{deal.unit}</div>
          {deal.originalPrice && (
            <div className="text-sm text-gray-400 line-through">
              ${deal.originalPrice.toFixed(2)}
            </div>
          )}
          {savings && (
            <div className="text-xs font-semibold text-[var(--ps-orange)] mt-1">
              Save {savings}%
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex gap-1 flex-wrap">
          {deal.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Valid thru {new Date(deal.validTo).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
