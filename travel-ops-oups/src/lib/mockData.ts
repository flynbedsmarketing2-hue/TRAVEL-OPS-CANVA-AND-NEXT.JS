import type { Booking } from "../types";

export const mockBookings: Booking[] = [
  {
    id: "bkg-lis-001",
    packageId: "pkg-lisbonne-0625",
    bookingType: "Confirmée",
    rooms: [
      { roomType: "Double", occupants: [{ type: "ADL", name: "Samir M." }, { type: "ADL", name: "Amel K." }] },
      { roomType: "Single", occupants: [{ type: "ADL", name: "Nadia B." }] },
    ],
    paxTotal: 3,
    uploads: {
      passportScans: ["samir-passport.pdf", "amel-passport.pdf"],
      requiredDocuments: ["Formulaire TAP"],
      paymentProofUrl: "recu-virement-001.pdf",
    },
    payment: {
      paymentMethod: "Virement",
      totalPrice: 555000,
      paidAmount: 420000,
      isFullyPaid: false,
    },
    createdAt: "2025-03-05T09:30:00.000Z",
  },
  {
    id: "bkg-lis-002",
    packageId: "pkg-lisbonne-0625",
    bookingType: "En option",
    reservedUntil: "2025-05-12",
    rooms: [
      { roomType: "Twin", occupants: [{ type: "ADL", name: "Yacine T." }, { type: "ADL", name: "Lina Z." }] },
      { roomType: "Child", occupants: [{ type: "CHD", name: "Rania T." }] },
    ],
    paxTotal: 3,
    uploads: {
      passportScans: ["yacine-passport.pdf"],
      requiredDocuments: ["Autorisation parentale"],
      paymentProofUrl: "",
    },
    payment: {
      paymentMethod: "Carte",
      totalPrice: 505000,
      paidAmount: 0,
      isFullyPaid: false,
    },
    createdAt: "2025-03-22T15:10:00.000Z",
  },
  {
    id: "bkg-sahara-001",
    packageId: "pkg-sahara-1125",
    bookingType: "Confirmée",
    rooms: [
      { roomType: "Twin", occupants: [{ type: "ADL", name: "Imene L." }, { type: "ADL", name: "Lamia L." }] },
      { roomType: "Child", occupants: [{ type: "CHD", name: "Riad L." }] },
    ],
    paxTotal: 3,
    uploads: {
      passportScans: ["imene-passport.pdf"],
      requiredDocuments: ["Autorisation sud"],
      paymentProofUrl: "recu-sahara-001.pdf",
    },
    payment: {
      paymentMethod: "Espèces",
      totalPrice: 715000,
      paidAmount: 715000,
      isFullyPaid: true,
    },
    createdAt: "2025-04-02T08:00:00.000Z",
  },
];

