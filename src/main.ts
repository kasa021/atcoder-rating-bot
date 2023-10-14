import dotenv from "dotenv";
import { GatewayIntentBits, Client, Partials } from "discord.js";
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

// addコマンド: ユーザーのAtCoderの情報を追加する
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!add")) {
    const username = message.content.split(" ")[1];
    if (!username) {
      message.channel.send("ユーザー名を入力してください");
      return;
    }
    const response = await AtCoderAPI.addContestInfo(username, contestInfo);
    message.channel.send(response);
  }
});

// deleteコマンド: ユーザーのAtCoderの情報を削除する
client.on("messageCreate", (message) => {
  if (message.content.startsWith("!delete")) {
    const username = message.content.split(" ")[1];
    if (!username) {
      message.channel.send("ユーザー名を入力してください");
      return;
    }
    const response = AtCoderAPI.deleteContestInfo(username, contestInfo);
    message.channel.send(response);
  }
});

// showコマンド: ユーザーのAtCoderの情報を表示する
client.on("messageCreate", (message) => {
  if (message.content.startsWith("!show")) {
    const username = message.content.split(" ")[1];
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
});

// listコマンド: 登録しているユーザーの一覧を表示する
client.on("messageCreate", (message) => {
  if (message.content.startsWith("!list")) {
    const list = contestInfo.map((item) => item.username).join("\n");
    message.channel.send(list);
  }
});

client.login(process.env.DISCORD_TOKEN);
