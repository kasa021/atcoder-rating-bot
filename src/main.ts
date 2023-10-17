import dotenv from "dotenv";
import { GatewayIntentBits, Client, Partials, Message } from "discord.js";
import { AtCoderContestInfo } from "./interface";
import * as AtCoderAPI from "./atcoderAPI";

dotenv.config();

const contestInfo: AtCoderContestInfo[] = [];

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

async function handleAddCommand(message: Message, username: string) {
  if (!username) {
    message.channel.send("ユーザー名を入力してください");
    return;
  }
  const response = await AtCoderAPI.addContestInfo(username, contestInfo);
  message.channel.send(response);
}

function handleDeleteCommand(message: Message, username: string) {
  if (!username) {
    message.channel.send("ユーザー名を入力してください");
    return;
  }
  const response = AtCoderAPI.deleteContestInfo(username, contestInfo);
  message.channel.send(response);
}

function handleShowCommand(message: Message, username: string) {
  if (!username) {
    message.channel.send("ユーザー名を入力してください");
    return;
  }
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
  if (contestInfo.length === 0) {
    message.channel.send("ユーザーが登録されていませんでした");
    return;
  }
  const list = contestInfo.map((item) => item.username).join("\n");
  message.channel.send(list);
}

client.on("messageCreate", async (message: Message) => {
  const content = message.content;
  const command = content.split(" ")[0];
  const username = content.split(" ")[1];

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
    default:
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
