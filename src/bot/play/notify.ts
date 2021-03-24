import type {
  GitHubNotifications,
  NotificationId,
} from "../exp/github-notification";
import type { Analecta } from "../exp/analecta";
import type { GitHubUser } from "../exp/github-user";
import { MessageEmbed } from "discord.js";

export interface Database {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
}

export interface Query {
  fetchNotification(user: GitHubUser): Promise<GitHubNotifications>;
}

const fetchErrorHandler = (send: (message: MessageEmbed) => Promise<void>) => (
  reason: unknown,
) => {
  const yellow = 0xffc208;
  send(
    new MessageEmbed()
      .setColor(yellow)
      .setTitle("通知データ取得のエラー発生")
      .setDescription(reason),
  );
  return null;
};

const hasIdsUpdated = (
  older: readonly NotificationId[],
  newer: readonly NotificationId[],
): boolean => {
  const newIdSet = new Set([...newer]);
  for (const oldE of older) {
    newIdSet.delete(oldE);
  }
  return newIdSet.size !== 0;
};

const sendSubjects = async (
  res: GitHubNotifications,
  send: (message: MessageEmbed) => Promise<void>,
  analecta: Analecta,
) => {
  const subjects = res.map(({ id, subject: { title } }) => ({
    name: `#${id}`,
    value: title,
  }));

  await send(
    new MessageEmbed()
      .addFields(subjects)
      .setTitle(analecta.BringIssue)
      .setURL("https://github.com/notifications"),
  );
};

export const notify = (db: Database, query: Query) => async (
  analecta: Analecta,
  send: (message: MessageEmbed) => Promise<void>,
): Promise<void> => {
  const user = await db.getUser();
  const { currentNotificationIds } = user;

  const res = await query
    .fetchNotification(user)
    .catch(fetchErrorHandler(send));
  if (res === null) {
    return;
  }
  const newIds = res.map(({ id }) => id);
  await db.update(newIds);

  if (hasIdsUpdated(currentNotificationIds, newIds)) {
    await sendSubjects(res, send, analecta);
  }
};
