import type { AdapterMail, PanelMail } from "../mail/message.ts";
import { parseAdapterMail, parsePanelMail } from "../mail/message.ts";
import { isPanelSender, isSourceSender } from "../mail/sender.ts";

export function acceptAdapterMail(input: unknown, senderUrl: string | undefined): AdapterMail | null {
  if (!isSourceSender(senderUrl)) {
    return null;
  }
  return parseAdapterMail(input);
}

export function acceptPanelMail(
  input: unknown,
  senderUrl: string | undefined,
  extensionOrigin: string,
): PanelMail | null {
  if (!isPanelSender(senderUrl, extensionOrigin)) {
    return null;
  }
  return parsePanelMail(input);
}
