export type Func<T> = () => T;
export type AsyncFunc<T> = () => Promise<T>;

export async function runInFolder<T>(
  folder: string,
  fn: Func<T> | AsyncFunc<T>) {
  const
    start = process.cwd(),
    alreadyThere = start === folder;

  if (!alreadyThere) {
    process.chdir(folder);
  }
  try {
    return await fn();
  } finally {
    if (!alreadyThere) {
      process.chdir(start);
    }
  }
}
