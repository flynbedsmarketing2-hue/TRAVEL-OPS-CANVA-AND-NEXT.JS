'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { buttonClassName } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import ProductWizard from "../../../components/ProductWizard";
import { useProductStore } from "../../../stores/useProductStore";

export default function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const product = useProductStore((state) => state.products.find((item) => item.id === productId));

  if (!product) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="text-sm text-[var(--muted)]">Produit introuvable. Verifie l'id ou reviens a la liste.</p>
          <Link href="/packages" className={buttonClassName({ variant: "outline" })}>
            <PackageSearch className="h-4 w-4" />
            Retour
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Produits"
        title={product.name || "Produit"}
        subtitle={
          <>
            <span className="font-mono">{product.productId || "Brouillon"}</span>
            <span> - </span>
            <span>{product.status === "published" ? "Publie" : "Brouillon"}</span>
          </>
        }
        actions={
          <Link href="/packages" className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        }
      />
      <ProductWizard initialProduct={product} />
    </div>
  );
}
