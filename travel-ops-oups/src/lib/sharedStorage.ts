import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "shared-data");

const resolveDataPath = (filename: string) => path.join(dataDir, filename);

export async function readSharedData<T>(filename: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(resolveDataPath(filename), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeSharedData(filename: string, data: unknown): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(resolveDataPath(filename), JSON.stringify(data, null, 2), "utf-8");
}
