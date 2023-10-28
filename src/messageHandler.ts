// messageHandler.ts
import { Message } from "discord.js";
import * as AtCoderAPI from "./atcoderAPI";
import { drawGraph } from "./drawGraph";
import { AtCoderContestInfo } from "./interface";

const contestInfo: AtCoderContestInfo[] = [];

function validateUsername(message: Message, username: string): boolean {
  if (!username) {
    message.channel.send("ユーザー名を入力してください");
    return false;
  }
  return true;
}

async function handleAddCommand(message: Message, username: string) {
  const response = await AtCoderAPI.addContestInfo(username, contestInfo);
  message.channel.send(response);
}

function handleDeleteCommand(message: Message, username: string) {
  const response = AtCoderAPI.deleteContestInfo(username, contestInfo);
  message.channel.send(response);
}

function handleShowCommand(message: Message, username: string) {
  const info = AtCoderAPI.getContestInfo(username, contestInfo);
  if (!info) {
    message.channel.send(`${username}は登録されていませんでした`);
    return;
  }
  const latestRating =
    info.contestResult[info.contestResult.length - 1].NewRating;
  message.channel.send(`${username}の最新のレートは${latestRating}です`);
}

function handleListCommand(message: Message) {
  const list = contestInfo.map((item) => item.username).join("\n");
  message.channel.send(list);
}

async function handleGraphCommand(message: Message, username: string) {
  const info = AtCoderAPI.getContestInfo(username, contestInfo);
  if (!info) {
    message.channel.send(`${username}は登録されていませんでした`);
    return;
  }
  const attachment = await drawGraph(username, contestInfo);
  message.channel.send({ files: [attachment] });
}

export const handleMessage = async (message: Message) => {
  const content = message.content;
  const [command, ...usernameParts] = content.split(" ");
  const usernames = usernameParts
    .join(" ")
    .split(",")
    .map((u) => u.trim()); // カンマ区切りで複数ユーザーネームを受け取る

  // コマンド一覧
  const validCommands = ["!add", "!delete", "!show", "!list", "!graph"];
  if (!validCommands.includes(command)) {
    return;
  }

  if (
    !["!list"].includes(command) &&
    usernames.some((u) => !validateUsername(message, u))
  ) {
    return;
  }

  switch (command) {
    case "!add":
      for (const username of usernames) {
        await handleAddCommand(message, username);
      }
      break;
    case "!delete":
      for (const username of usernames) {
        handleDeleteCommand(message, username);
      }
      break;
    case "!show":
      for (const username of usernames) {
        handleShowCommand(message, username);
      }
      break;
    case "!list":
      handleListCommand(message);
      break;
    case "!graph":
      for (const username of usernames) {
        await handleGraphCommand(message, username);
      }
      break;
    default:
      break;
  }
};
