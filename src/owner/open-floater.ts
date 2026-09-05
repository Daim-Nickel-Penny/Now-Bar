export async function openFloater(shell: HTMLElement): Promise<Window | null> {
  if (!("documentPictureInPicture" in window)) {
    return null;
  }
  const width = Math.max(200, shell.clientWidth);
  const height = Math.max(80, shell.clientHeight);
  const pip = await window.documentPictureInPicture.requestWindow({
    width,
    height,
    disallowReturnToOpener: true,
  });
  for (const sheet of document.querySelectorAll("style, link[rel='stylesheet']")) {
    pip.document.head.appendChild(sheet.cloneNode(true));
  }
  pip.document.body.appendChild(shell);
  pip.addEventListener("pagehide", () => {
    document.body.appendChild(shell);
  });
  return pip;
}
