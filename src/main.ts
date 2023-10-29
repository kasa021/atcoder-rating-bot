import dotenv from "dotenv";
import { GatewayIntentBits, Client, Partials, Message } from "discord.js";
import { handleMessage } from "./messageHandler";

dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.on("messageCreate", async (message: Message) => {
  // ここを変更する。ここでメッセージを処理する関数を変更する。
  await handleMessage(message);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  await interaction.deferUpdate();
});

client.login(process.env.DISCORD_TOKEN);
