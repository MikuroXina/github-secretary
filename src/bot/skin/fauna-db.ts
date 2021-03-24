/* eslint-disable new-cap */

import type {
  SubscriptionDatabase,
  UpdateHandler,
  UserDatabase,
} from "../abst/user-database";
import fauna, { query as q } from "faunadb";
import type { DiscordId } from "../exp/discord-id";
import type { GitHubUser } from "../exp/github-user";
import type { NotificationId } from "../exp/github-notification";

export class FaunaDB implements SubscriptionDatabase, UserDatabase {
  private client: fauna.Client;

  constructor(secret: string) {
    this.client = new fauna.Client({ secret });
  }

  private handlers: UpdateHandler[] = [];

  onUpdate(handler: UpdateHandler): void {
    this.handlers.push(handler);

    this.client.query(q.Get(q.Match(q.Index("all_users")))).then((payload) => {
      if (!payload) {
        return;
      }
      let res = payload;
      if (!Array.isArray(res)) {
        res = { data: [res] };
      }
      const { data } = res as {
        data: { ref: fauna.values.Ref; data: GitHubUser }[];
      };
      data.forEach(({ ref: { id }, data: datum }) => {
        handler.handleUpdate(id as DiscordId, datum);
      });
    });
  }

  private async notifyUpdate(id: DiscordId): Promise<void> {
    const { data } = (await this.client.query(
      q.Get(q.Ref(q.Collection("users"), id)),
    )) as {
      data: GitHubUser;
    };

    for (const handler of this.handlers) {
      handler.handleUpdate(id, data);
    }
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[],
  ): Promise<void> {
    await this.client.query(
      q.Update(q.Ref(q.Collection("users"), id), {
        data: { currentNotificationIds: notificationIds },
      }),
    );
    await this.notifyUpdate(id);
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    try {
      await this.client.query(
        q.Create(q.Ref(q.Collection("users"), id), { data: { ...user } }),
      );
    } catch (ignore) {
      // Ignore
    }
    await this.notifyUpdate(id);
  }

  async unregister(id: DiscordId): Promise<boolean> {
    try {
      await this.client.query(q.Delete(q.Ref(q.Collection("users"), id)));
    } catch (_err) {
      return false;
    }
    await this.notifyUpdate(id);
    return true;
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | null> {
    try {
      const { data } = (await this.client.query(
        q.Get(q.Ref(q.Collection("users"), discordId)),
      )) as { data: GitHubUser };
      return data;
    } catch (err) {
      return null;
    }
  }
}
