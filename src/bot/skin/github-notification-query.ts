import { GitHubNotifications } from "../exp/github-notification";
import { GitHubUser } from "../exp/github-user";
import { Query } from "../play/notify";
import fetch from "node-fetch";

export const notificationQuery: Query = {
  async fetchNotification({
    userName,
    notificationToken,
  }: GitHubUser): Promise<GitHubNotifications> {
    const rawRes = await fetch("https://api.github.com/notifications", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${userName}:${notificationToken}`,
        ).toString("base64")}`,
      },
    });
    if (!rawRes.ok) {
      throw new Error("fail to fetch notifications");
    }
    return [...((await rawRes.json()) as unknown[])] as GitHubNotifications;
  },
};
