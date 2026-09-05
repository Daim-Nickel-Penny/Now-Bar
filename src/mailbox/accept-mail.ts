import type { AdapterMail, OwnerMail } from "../mail/message.ts";
import { parseAdapterMail, parseOwnerMail } from "../mail/message.ts";
import { isOwnerSender, isSourceSender } from "../mail/sender.ts";

export function acceptAdapterMail(
  input: unknown,
  senderUrl: string | undefined,
): AdapterMail | null {
  if (!isSourceSender(senderUrl)) {
    return null;
  }
  return parseAdapterMail(input);
}

export function acceptOwnerMail(
  input: unknown,
  senderUrl: string | undefined,
  extensionOrigin: string,
): OwnerMail | null {
  if (!isOwnerSender(senderUrl, extensionOrigin)) {
    return null;
  }
  return parseOwnerMail(input);
}
