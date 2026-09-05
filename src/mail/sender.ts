export function isSourceSender(url: string | undefined): boolean {
  if (url === undefined) {
    return false;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") {
    return false;
  }
  if (parsed.username !== "" || parsed.password !== "") {
    return false;
  }
  return (
    parsed.hostname === "music.youtube.com" ||
    parsed.hostname === "open.spotify.com"
  );
}

export function isOwnerSender(
  url: string | undefined,
  extensionOrigin: string,
): boolean {
  if (url === undefined || extensionOrigin === "") {
    return false;
  }
  return url.startsWith(extensionOrigin);
}
