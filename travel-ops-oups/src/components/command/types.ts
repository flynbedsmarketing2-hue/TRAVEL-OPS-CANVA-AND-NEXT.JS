import type { ReactNode } from "react";

export type Command = {
  id: string;
  label: string;
  keywords?: string[];
  group: string;
  icon: ReactNode;
  action: () => void;
};
