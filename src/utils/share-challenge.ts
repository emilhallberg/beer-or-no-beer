export async function shareChallenge(score: number, name?: string | null) {
  const query = new URLSearchParams({ score: score.toString() });
  if (name?.trim()) query.set("from", name.trim());
  const url = new URL(`/challenge?${query}`, window.location.origin).toString();

  if (navigator.share) {
    try {
      await navigator.share({ title: "Beer or No Beer?", url });
      return "Utmaningen har delats.";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "";
      // If the share sheet fails, still offer the clipboard fallback.
    }
  }
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(url);
  return "Länken är kopierad. Dela den med en vän!";
}
