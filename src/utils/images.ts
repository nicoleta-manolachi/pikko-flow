import { Directory, File, Paths } from 'expo-file-system';

const dir = () => new Directory(Paths.document, 'item-images');

/** Copies a picker (cache) image into permanent app storage and returns its URI. */
export function persistImage(tempUri: string): string {
  const d = dir();
  if (!d.exists) d.create();
  const dest = new File(d, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
  new File(tempUri).copy(dest);
  return dest.uri;
}

export function deleteImageFile(uri: string | null | undefined) {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // ignore: best-effort cleanup
  }
}
