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
  const command = content.split(" ")[0];
  const username = content.split(" ")[1];

  // コマンド一覧
  const validCommands = ["!add", "!delete", "!show", "!list", "!graph"];
  if (!validCommands.includes(command)) {
    return;
  }

  if (!["!list"].includes(command) && !validateUsername(message, username)) {
    return;
  }

  switch (command) {
    case "!add":
      await handleAddCommand(message, username);
      break;
    case "!delete":
      handleDeleteCommand(message, username);
      break;
    case "!show":
      handleShowCommand(message, username);
      break;
    case "!list":
      handleListCommand(message);
      break;
    case "!graph": {
      await handleGraphCommand(message, username);
      break;
    }
    default:
      break;
  }
};
