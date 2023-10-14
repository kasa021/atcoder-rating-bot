import dotenv from "dotenv";
import axios from "axios";
import { GatewayIntentBits, Client, Partials } from "discord.js";
import { AtCoderContestInfo } from "./interface";
dotenv.config();

const ATCODER_BASE_URL = "https://atcoder.jp/users";

// AtCoderContestInfoのオブジェクト型の配列
const contestInfo: AtCoderContestInfo[] = [];

const atcoderAPI = axios.create({
  baseURL: ATCODER_BASE_URL,
});

const fetchAtCoderContestInfo = async (
  username: string
): Promise<AtCoderContestInfo> => {
  try {
    const res = await atcoderAPI.get(`/${username}/history/json`);
    return {
      username: username,
      contestResult: res.data,
    };
  } catch (error) {
    console.error("Error fetching AtCoder contest info:", error);
    throw error;
  }
};

const addContestInfo = async (username: string): Promise<string> => {
  try {
    const info = await fetchAtCoderContestInfo(username);
    if (info.contestResult.length === 0) {
      return `${username}のコンテスト情報が存在しませんでした`;
    }
    const index = contestInfo.findIndex(
      (item) => item.username === info.username
    );
    if (index !== -1) {
      contestInfo[index] = info;
    } else {
      contestInfo.unshift(info);
    }
    return `${username}の情報を追加しました`;
  } catch (error) {
    console.error("Error adding contest info:", error);
    return "エラーが発生しました";
  }
};

const deleteContestInfo = (username: string) => {
  const index = contestInfo.findIndex((item) => item.username === username);
  if (index !== -1) {
    contestInfo.splice(index, 1);
    return `${username}の情報を削除しました`;
  } else {
    return `${username}は登録されていませんでした`;
  }
};

const getContestInfo = (username: string) => {
  const index = contestInfo.findIndex((item) => item.username === username);
  if (index !== -1) {
    return contestInfo[index];
  } else {
    return null;
  }
};

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

client.on("ready", async () => {
  console.log("ready");
});

// addコマンド: ユーザーのAtCoderの情報を追加する
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!add")) {
    const username = message.content.split(" ")[1];
    if (!username) {
      message.channel.send("ユーザー名を入力してください");
      return;
    }
    const response = await addContestInfo(username);
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
    const response = deleteContestInfo(username);
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
    const info = getContestInfo(username);
    if (!info) {
      message.channel.send(`${username}は登録されていませんでした`);
      return;
    }
    // userの最新のレートを取得,contestResultの最後の要素が最新のレート
    const latestRating =
      info.contestResult[info.contestResult.length - 1].NewRating;
    message.channel.send(`${username}の最新のレートは${latestRating}です`);
    console.log(latestRating);
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
