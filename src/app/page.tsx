import Link from "next/link";
import Image from "next/image";
import deals from "../../data/deals.json";
import recipes from "../../data/recipes.json";

export default function Home() {
  const featuredRecipe = recipes.find((r) => r.featured);
  const topDeals = deals.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--ps-red)] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <Image
            src="/logo-full.jpg"
            alt="Project Sauce"
            width={180}
            height={180}
            className="mx-auto mb-6 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Eat Well for Less in{" "}
            <span className="text-[var(--ps-orange)]">Downtown Brooklyn</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Project Sauce helps you find the most affordable groceries, best
            deals, and budget-friendly recipes in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stores"
              className="inline-block bg-[var(--ps-orange)] hover:bg-[var(--ps-orange-light)] text-[var(--ps-red-dark)] font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Find Stores Near You
            </Link>
            <Link
              href="/deals"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors border border-white/20"
            >
              Browse Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-[var(--ps-red)]">
            <div className="text-3xl font-bold text-[var(--ps-red)]">16</div>
            <div className="text-gray-600 text-sm mt-1">Stores Tracked</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-[var(--ps-orange)]">
            <div className="text-3xl font-bold text-[var(--ps-orange)]">
              {deals.length}
            </div>
            <div className="text-gray-600 text-sm mt-1">Active Deals</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-[var(--ps-brown)]">
            <div className="text-3xl font-bold text-[var(--ps-brown)]">
              Weekly
            </div>
            <div className="text-gray-600 text-sm mt-1">Recipe Updates</div>
          </div>
        </div>
      </section>

      {/* Top Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">This Week&apos;s Best Prices</h2>
          <Link
            href="/deals"
            className="text-[var(--ps-red)] font-medium hover:underline"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <span className="text-xs text-gray-500">{deal.storeName}</span>
              <h3 className="font-semibold mt-1">{deal.title}</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-[var(--ps-red)]">
                  ${deal.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">{deal.unit}</span>
                {deal.originalPrice != null && (
                  <span className="text-sm text-gray-400 line-through">
                    ${Number(deal.originalPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe of the Week */}
      {featuredRecipe && (
        <section className="bg-[var(--ps-cream)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold mb-8">Recipe of the Week</h2>
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <span className="deal-badge bg-[var(--ps-orange)] text-[var(--ps-red-dark)]">
                    Featured
                  </span>
                  <h3 className="text-2xl font-bold mt-3">
                    {featuredRecipe.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {featuredRecipe.description}
                  </p>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span>Serves {featuredRecipe.servings}</span>
                    <span>Prep: {featuredRecipe.prepTime}</span>
                    <span>Cook: {featuredRecipe.cookTime}</span>
                    <span>{featuredRecipe.difficulty}</span>
                  </div>
                  <Link
                    href="/recipe"
                    className="inline-block mt-6 bg-[var(--ps-red)] hover:bg-[var(--ps-red-light)] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    See Full Recipe & Best Prices
                  </Link>
                </div>
                <div className="md:w-64 shrink-0">
                  <h4 className="font-semibold mb-3">Ingredients</h4>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    {featuredRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{ing.name}</span>
                        <span className="text-gray-400">{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-[var(--ps-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--ps-red)]">1</span>
            </div>
            <h3 className="font-semibold mb-2">Browse the Map</h3>
            <p className="text-sm text-gray-600">
              Find affordable grocery stores near you in Downtown Brooklyn with
              our interactive map.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-[var(--ps-orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--ps-orange)]">2</span>
            </div>
            <h3 className="font-semibold mb-2">Compare Prices</h3>
            <p className="text-sm text-gray-600">
              Search and filter current flyer prices across all tracked stores to
              find the best value.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-[var(--ps-brown)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--ps-brown)]">3</span>
            </div>
            <h3 className="font-semibold mb-2">Cook on a Budget</h3>
            <p className="text-sm text-gray-600">
              Get our weekly recipe with a breakdown of where to buy each
              ingredient for the cheapest price.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
