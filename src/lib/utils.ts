import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPublicUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("blob.vercel-storage.com")) {
    return `/api/blob?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function deleteBlobAssets(urls: (string | null | undefined)[]) {
  const { del } = await import("@vercel/blob");
  const validUrls = urls.filter((url): url is string => typeof url === "string" && url.startsWith("https://"));
  if (validUrls.length === 0) return;
  try {
    await del(validUrls, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("Failed to delete Vercel Blob assets:", error);
  }
}
