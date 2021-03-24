import type { DiscordId } from "./discord-id";
import type { NotificationId } from "./github-notification";

declare const nominalGitHubUser: unique symbol;
export interface GitHubUser {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
  [nominalGitHubUser]: never;
}

export type GitHubUsers = Map<DiscordId, GitHubUser>;

export const serialize = (users: GitHubUsers): string => {
  const obj: { [key: string]: GitHubUser } = {};
  const it = users.entries();
  for (let next = it.next(); !next.done; next = it.next()) {
    const [key, value] = next.value;
    obj[key as string] = value;
  }
  return JSON.stringify(obj);
};

export const deserialize = (serial: string): GitHubUsers => {
  const parsed = JSON.parse(serial) as { [key: string]: GitHubUser };
  const map = new Map<DiscordId, GitHubUser>();
  for (const [key, value] of Object.entries(parsed)) {
    map.set(key as DiscordId, value);
  }
  return map;
};
