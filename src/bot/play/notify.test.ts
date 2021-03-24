import { Database, Query, notify } from "./notify";
import {
  GitHubNotifications,
  NotificationId,
} from "../exp/github-notification";
import { GitHubUser } from "../exp/github-user";
import { MessageEmbed } from "discord.js";
import { analectaForTest } from "../skin/test-analecta";

const db: Database = {
  getUser: () =>
    Promise.resolve({
      userName: "Alice",
      notificationToken: "TEST_TOKEN",
      currentNotificationIds: [] as NotificationId[],
    } as GitHubUser),
  update: (ids) => {
    expect(ids).toEqual(["0123456789"]);
    return Promise.resolve();
  },
};

const query: Query = {
  fetchNotification: () =>
    Promise.resolve([
      {
        id: "0123456789",
        subject: {
          title: "An Issue",
        },
      },
    ] as GitHubNotifications),
};

test("emit a notification", async (done) => {
  const analecta = await analectaForTest();

  await notify(db, query)(analecta, (message: MessageEmbed) => {
    expect(message).toEqual(
      new MessageEmbed()
        .addFields([
          {
            name: "#0123456789",
            value: "An Issue",
          },
        ])
        .setTitle(analecta.BringIssue)
        .setURL("https://github.com/notifications"),
    );
    done();
    return Promise.resolve();
  });
});
