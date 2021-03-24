import type { DiscordId } from "../exp/discord-id";
import type { MessageEmbed } from "discord.js";

export interface Message {
  getAuthorId(): DiscordId;
  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null>;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
  panic(reason: unknown): never;
}
