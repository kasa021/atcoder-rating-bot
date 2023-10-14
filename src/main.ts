import dotenv from "dotenv";
import axios from "axios";
import { GatewayIntentBits, Client, Partials } from "discord.js";
import { AtCoderContestInfo } from "./interface";
dotenv.config();

const ATCODER_BASE_URL = "https://atcoder.jp/users";

// AtCoderContestInfoのオブジェクト型の配列
let contestInfo: AtCoderContestInfo[] = [];

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

const addContestInfo = async (username: string) => {
  const info = await fetchAtCoderContestInfo(username);
  // すでに存在している場合は上書きする
  const index = contestInfo.findIndex(
    (item) => item.username === info.username  
  );
  if (index === -1) {
    contestInfo.unshift(info);
  } else {
    contestInfo[index] = info;
  }
};

const deleteContestInfo = (username: string) => {
  const index = contestInfo.findIndex(
    (item) => item.username === username
  );
  if (index !== -1) {
    contestInfo.splice(index, 1);
  }
};

const getContestInfo = (username: string) => {
  const index = contestInfo.findIndex(
    (item) => item.username === username
  );
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
  // api使って情報を取得する
  console.log("ready");
  await addContestInfo("kAsA02");
  console.log(contestInfo);
});

client.login(process.env.DISCORD_TOKEN);
