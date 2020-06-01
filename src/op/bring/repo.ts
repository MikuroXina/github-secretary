import { Analecta } from '../../exp/analecta';
import { Message } from 'discord.js';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import fetch from 'node-fetch';
import { replyFailure } from '../reply-failure';

const ghPattern = /^\/ghr\s+([^/]+)(\/(.+))?$/;

export const bringRepo = async (analecta: Analecta, msg: Message): Promise<boolean> => {
  if (!ghPattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(ghPattern);
  if (matches == null) {
    return false;
  }

  msg.channel.startTyping();
  const res = await connectProcessors([
    internalRepo(matches[1]),
    externalRepo(matches[1])(matches[3]),
    replyFailure,
  ])(analecta, msg);
  msg.channel.stopTyping();
  return res;
};

const externalRepo = (owner: string) => (repo: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await await (await fetch(apiUrl)).json();

  if (!res.url) {
    return false;
  }

  const {
    name,
    description,
    html_url,
    owner: { avatar_url, login },
  } = res;
  msg.channel.send({
    embed: {
      author: {
        name: login,
        icon_url: avatar_url,
      },
      url: html_url,
      description,
      title: name,
      footer: { text: analecta.Subscribe },
    },
  });

  return true;
};

const internalRepo = externalRepo('approvers');