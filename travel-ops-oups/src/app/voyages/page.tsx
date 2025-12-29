'use client';

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Plane } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { buttonClassName } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { usePackageStore } from "../../stores/usePackageStore";

export default function VoyagesPage() {
  const { packages } = usePackageStore();

  const published = packages.filter((pkg) => pkg.status === "published");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalogue"
        title="Voyages publies"
        subtitle="Liste interne des offres actives."
        actions={
          <Link href="/sales" className={buttonClassName({ variant: "outline" })}>
            Aller aux ventes
          </Link>
        }
      />

        {published.length === 0 ? (
          <div className="section-shell">
            <p className="text-sm text-[var(--muted)]">Aucun package publie pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {published.map((pkg) => {
              const image = pkg.general.imageUrl;
              return (
                <Card key={pkg.id} className="overflow-hidden">
                  <div className="relative h-40 bg-[var(--token-surface-2)]">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[var(--token-surface-2)]" />
                    )}
                    <div className="absolute inset-0 bg-[var(--token-text)]/35" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--token-inverse)]">
                          {pkg.general.productName}
                        </p>
                        <p className="truncate text-xs text-[var(--token-inverse)] opacity-80">
                          {pkg.flights.destination || "-"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--token-inverse)]/15 px-3 py-1 text-xs font-semibold text-[var(--token-inverse)] backdrop-blur">
                        Stock {pkg.general.stock}
                      </span>
                    </div>
                  </div>

                  <CardContent className="space-y-4 pt-5">
                    <div className="space-y-1 text-sm text-[var(--text)]">
                      <p className="line-clamp-2">
                        Villes:{" "}
                        <span className="font-semibold">
                          {pkg.flights.cities.length ? pkg.flights.cities.join(", ") : "A definir"}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Code: <span className="font-mono">{pkg.general.productCode || "-"}</span>
                      </p>
                    </div>

                    <Link href="/sales" className={buttonClassName({ variant: "primary" })}>
                      <Plane className="h-4 w-4" />
                      Reserver
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}

