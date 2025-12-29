import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProductId } from "@/lib/productId";

export async function POST(_: Request, context: { params: { id: string } }) {
  const id = context.params.id;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const nextProductId = product.productId ?? generateProductId();
  // TODO: adjust productId format to match business rules once defined.

  const updated = await prisma.product.update({
    where: { id },
    data: {
      productId: nextProductId,
      status: "PUBLISHED",
    },
    include: {
      departures: true,
      hotels: { include: { rates: true } },
      services: true,
    },
  });

  return NextResponse.json(updated);
}
