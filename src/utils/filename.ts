import path from "path";

/**
 * Sanitize a filename by removing special characters, emojis, and replacing spaces with hyphens.
 * Returns only the clean base name — no extension, no UUID.
 * The caller (service layer) is responsible for appending UUIDs and extensions.
 * @param fileName - The original filename (with or without extension)
 * @returns A sanitized base name string
 */
export const sanitizeFilename = (fileName: string): string => {
  const ext = path.extname(fileName);
  const name = path.basename(fileName, ext);

  // 1. Convert to lowercase
  // 2. Remove emojis and non-ASCII characters
  // 3. Replace spaces and special characters with hyphens
  // 4. Remove consecutive hyphens
  // 5. Trim hyphens from start and end
  const cleanName = name
    .toLowerCase()
    .normalize("NFD") // Split accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens

  return cleanName || "video";
};
