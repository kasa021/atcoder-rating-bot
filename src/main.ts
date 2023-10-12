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

const addContestInfo = (info: AtCoderContestInfo) => {
  contestInfo = [info, ...contestInfo];
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
  const newContestInfo = await fetchAtCoderContestInfo("kAsA02");
  addContestInfo(newContestInfo);
  console.log(contestInfo);
  console.log(contestInfo[0].contestResult.length);
});

client.login(process.env.DISCORD_TOKEN);
