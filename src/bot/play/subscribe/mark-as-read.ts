import { NotificationId, includes } from "../../exp/github-notification";
import type { Analecta } from "../../exp/analecta";
import type { CommandProcessor } from "../../abst/connector";
import type { Message } from "../../abst/message";
import { MessageEmbed } from "discord.js";
import type { NotificationApi } from "../../abst/api";
import type { UserDatabase } from "../../abst/user-database";
import { replyFailure } from "../../abst/reply-failure";

const markPattern = /^\/ghm (?<notification>[0-9]+)\s*$/u;

export const markAsRead = (
  db: UserDatabase,
  query: NotificationApi,
): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(markPattern);
  if (matches === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const notificationId = matches.groups!.notification as NotificationId;

  return msg
    .withTyping(
      markNotificationAsRead({
        db,
        msg,
        analecta,
        id: notificationId,
        query,
      }),
    )
    .catch(msg.panic);
};

const markNotificationAsRead = ({
  db,
  msg,
  analecta,
  id,
  query,
}: {
  db: UserDatabase;
  msg: Message;
  analecta: Analecta;
  id: NotificationId;
  query: NotificationApi;
}) => async () => {
  const user = await db.fetchUser(msg.getAuthorId());
  if (!user) {
    await msg.reply(analecta.NotSubscribed);
    return true;
  }

  const { currentNotificationIds } = user;
  if (!includes(currentNotificationIds, id)) {
    return replyFailure(analecta, msg);
  }

  const res = await query.markAsRead(user, id);
  if (!res) {
    return replyFailure(analecta, msg);
  }

  await msg.sendEmbed(
    new MessageEmbed()
      .setTitle(analecta.MarkAsRead)
      .setURL("https://github.com/notifications"),
  );
  return true;
};
