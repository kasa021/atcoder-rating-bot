// messageHandler.ts
import { Message, StringSelectMenuInteraction } from "discord.js";
import * as AtCoderAPI from "./atcoderAPI";
import { drawGraph } from "./drawGraph";
import { AtCoderContestInfo } from "./interface";
import { selectUsername } from "./selectMenu";

const contestInfo: AtCoderContestInfo[] = [];

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
  console.log("AAAAAAAAA");
  if(contestInfo.length === 0) {
    message.channel.send("ユーザーが登録されていません");
    return;
  }
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

async function handleSelectCommand(message: Message) {
  const sentMenu = await selectUsername(message, contestInfo);

  const filter = (interaction: StringSelectMenuInteraction) => {
    return interaction.customId === "select";
  };
  const collected = await sentMenu.awaitMessageComponent({
    filter,
    time: 10000,
  });
  if (!collected) {
    message.channel.send("タイムアウトしました。もう一度やり直してください。");
    return;
  }
  const usernames = collected.values;
  return usernames;
}

export const handleMessage = async (message: Message) => {
  // コマンド一覧
  const validCommands = [
    "!add",
    "!delete",
    "!show",
    "!list",
    "!graph",
    "!select",
  ];
  const content = message.content;
  const [command, ...usernameParts] = content.split(" ");
  if (!validCommands.includes(command)) {
    return;
  }

  let usernames: string[] = [];
  console.log(usernameParts);

  switch (command) {
    case "!delete":
    case "!show":
    case "!graph":
      usernames = await handleSelectCommand(message);
      break;
    case "!add":
      if (usernameParts.length === 0) {
        message.channel.send("ユーザー名を入力してください");
        return;
      }
      usernames = usernameParts
        .join(" ")
        .split(" ")
        .map((u) => u.trim());
      break;
  }

  console.log(command);
  console.log(usernames);

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
      console.log(usernames);
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
