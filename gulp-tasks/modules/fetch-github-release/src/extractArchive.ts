import decompress from "decompress";

/**
 * Extracts a release archive (zip, tar.gz) into the destination.
 * Resolves the extracted entries' paths, relative to the destination.
 */
export async function extractArchive(
  archivePath: string,
  destination: string
): Promise<string[]> {
  const files = await decompress(archivePath, destination);
  return files.map(file => file.path);
}
