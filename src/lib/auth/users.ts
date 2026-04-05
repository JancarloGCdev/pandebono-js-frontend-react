import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

let queue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users), "utf-8");
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const users = await readUsers();
  return users.find((u) => u.email === email);
}

export async function createUserRecord(
  user: Omit<StoredUser, "createdAt">
): Promise<StoredUser> {
  return runExclusive(async () => {
    const users = await readUsers();
    if (users.some((u) => u.email === user.email)) {
      throw new Error("EMAIL_TAKEN");
    }
    const record: StoredUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    users.push(record);
    await writeUsers(users);
    return record;
  });
}
