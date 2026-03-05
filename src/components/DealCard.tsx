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
  "weekly-flyer": { bg: "bg-red-50", text: "text-[var(--ps-red)]" },
  "weekly-sale": { bg: "bg-red-50", text: "text-[var(--ps-red)]" },
  "everyday-low": { bg: "bg-amber-50", text: "text-amber-800" },
  coupon: { bg: "bg-purple-100", text: "text-purple-800" },
  "meal-deal": { bg: "bg-orange-100", text: "text-orange-800" },
};

const typeLabels: Record<string, string> = {
  "weekly-flyer": "Weekly Flyer",
  "weekly-sale": "Weekly Flyer",
  "everyday-low": "Everyday Low",
  coupon: "Coupon",
  "meal-deal": "Meal Deal",
};

interface DealCardProps {
  deal: Deal;
  isLowestPrice?: boolean;
  avgPrice?: number | null;
}

export default function DealCard({ deal, isLowestPrice, avgPrice }: DealCardProps) {
  const colors = typeColors[deal.type] || typeColors["weekly-flyer"];
  const savings =
    deal.originalPrice && deal.originalPrice > deal.price
      ? ((1 - deal.price / deal.originalPrice) * 100).toFixed(0)
      : null;
  const avgSavings =
    avgPrice && avgPrice > deal.price
      ? ((1 - deal.price / avgPrice) * 100).toFixed(0)
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
          {isLowestPrice && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--ps-orange)] bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1">
              Best Price in BK
            </span>
          )}
          {deal.description && (
            <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
          )}
        </div>
        <div className="text-right ml-4 shrink-0">
          {deal.originalPrice != null && deal.originalPrice > deal.price ? (
            <div className="text-base text-gray-400 line-through">
              ${Number(deal.originalPrice).toFixed(2)}
            </div>
          ) : avgPrice && avgPrice > deal.price ? (
            <div className="text-sm text-gray-400">
              <span className="line-through">${avgPrice.toFixed(2)}</span>
              <span className="text-[10px] block text-gray-400">avg across stores</span>
            </div>
          ) : null}
          <div className="text-2xl font-bold text-[var(--ps-red)]">
            ${deal.price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{deal.unit}</div>
          {savings ? (
            <div className="text-xs font-bold text-white bg-[var(--ps-orange)] rounded-full px-2 py-0.5 mt-1 inline-block">
              {savings}% OFF
            </div>
          ) : avgSavings ? (
            <div className="text-xs font-bold text-[var(--ps-red-dark)] bg-amber-100 rounded-full px-2 py-0.5 mt-1 inline-block">
              {avgSavings}% cheaper than avg
            </div>
          ) : null}
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
          From store flyer &middot; Valid thru {new Date(deal.validTo).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
