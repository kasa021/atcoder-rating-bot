import dotenv from "dotenv";
import { GatewayIntentBits, Client, Partials, Message } from "discord.js";
import { handleMessage } from "./messageHandler";

dotenv.config();

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

client.on("messageCreate", async (message: Message) => {
  await handleMessage(message);
});

client.login(process.env.DISCORD_TOKEN);
