'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Booking } from "../types";
import { mockBookings } from "../lib/mockData";
import { generateId, makePersistStorage } from "./storeUtils";

const BOOKINGS_ENDPOINT = "/api/shared/bookings";

const persistBookingsToServer = (bookings: Booking[]) => {
  if (typeof window === "undefined") return;
  void fetch(BOOKINGS_ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookings }),
  }).catch((reason) => {
    console.error("Unable to sync bookings with shared backend", reason);
  });
};

const loadBookingsFromServer = async (): Promise<Booking[] | null> => {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(BOOKINGS_ENDPOINT);
    if (!response.ok) {
      console.error("Shared bookings backend unavailable", response.statusText);
      return null;
    }
    const data = (await response.json()) as Booking[];
    return data;
  } catch (error) {
    console.error("Failed to load bookings from shared backend", error);
    return null;
  }
};

type BookingStore = {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  updateBooking: (id: string, updater: Partial<Booking>) => Booking | null;
  deleteBooking: (id: string) => void;
  reset: () => void;
  loadFromServer: () => Promise<void>;
};

const storage = makePersistStorage();

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => {
      const syncBookings = () => persistBookingsToServer(get().bookings);
      return {
        bookings: [...mockBookings],
        addBooking: (booking) => {
          const newBooking: Booking = {
            ...booking,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          set({ bookings: [newBooking, ...get().bookings] });
          syncBookings();
          return newBooking;
        },
        updateBooking: (id, updater) => {
          let result: Booking | null = null;
          set({
            bookings: get().bookings.map((existing) => {
              if (existing.id !== id) return existing;
              result = { ...existing, ...updater };
              return result;
            }),
          });
          if (result) syncBookings();
          return result;
        },
        deleteBooking: (id) => {
          set({ bookings: get().bookings.filter((booking) => booking.id !== id) });
          syncBookings();
        },
        reset: () => {
          set({ bookings: [] });
          syncBookings();
        },
        loadFromServer: async () => {
          const sharedBookings = await loadBookingsFromServer();
          if (sharedBookings) {
            set({ bookings: sharedBookings });
          }
        },
      };
    },
    {
      name: "travelops-bookings-store",
      storage,
    }
  )
);
