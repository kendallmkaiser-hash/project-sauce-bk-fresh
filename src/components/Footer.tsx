import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[var(--ps-red-dark)] text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logo-icon.jpg"
                alt="Project Sauce"
                width={36}
                height={36}
                className="rounded-full"
              />
              <h3 className="text-[var(--ps-orange)] font-bold text-lg">
                Project Sauce
              </h3>
            </div>
            <p className="text-sm leading-relaxed">
              Helping Downtown Brooklyn eat well for less. We believe everyone
              deserves access to affordable, nutritious food.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/stores" className="block hover:text-[var(--ps-orange)]">
                Store Map
              </Link>
              <Link href="/deals" className="block hover:text-[var(--ps-orange)]">
                This Week&apos;s Deals
              </Link>
              <Link href="/recipe" className="block hover:text-[var(--ps-orange)]">
                Recipe of the Week
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">About</h4>
            <p className="text-sm leading-relaxed">
              Project Sauce is a community non-profit dedicated to food
              affordability in Brooklyn. Prices and deals are updated weekly.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} Project Sauce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
