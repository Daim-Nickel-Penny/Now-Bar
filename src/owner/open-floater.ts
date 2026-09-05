export async function openFloater(shell: HTMLElement): Promise<Window | null> {
  if (!("documentPictureInPicture" in window)) {
    return null;
  }
  const pip = await window.documentPictureInPicture.requestWindow({
    width: Math.max(160, shell.clientWidth),
    height: Math.max(80, shell.clientHeight),
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
