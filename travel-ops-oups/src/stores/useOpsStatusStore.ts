import { create } from "zustand";
import type { OpsStatus } from "../types";

type OpsStatusStore = {
  statusByKey: Record<string, OpsStatus>;
  setStatus: (packageId: string, groupId: string, status: OpsStatus) => void;
};

const makeKey = (packageId: string, groupId: string) => `${packageId}:${groupId}`;

export const useOpsStatusStore = create<OpsStatusStore>((set) => ({
  statusByKey: {},
  setStatus: (packageId, groupId, status) =>
    set((state) => ({
      statusByKey: { ...state.statusByKey, [makeKey(packageId, groupId)]: status },
    })),
}));
