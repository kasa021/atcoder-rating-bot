import dotenv from "dotenv";
import {
  GatewayIntentBits,
  Client,
  Partials,
  Message,
  AttachmentBuilder,
} from "discord.js";
import { AtCoderContestInfo } from "./interface";
import { createCanvas } from "canvas";
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

client.on("messageCreate", async (message: Message) => {
  const content = message.content;
  const command = content.split(" ")[0];
  const username = content.split(" ")[1];
  // '!graph'コマンドで反応
  if (command === "!graph") {
    // Canvasを作成
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // 背景を白に設定
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const userContestInfo = await AtCoderAPI.getContestInfo(
      username,
      contestInfo
    );
    if (!userContestInfo) {
      message.channel.send(`${username}は登録されていませんでした`);
      return;
    }
    // レーティングと日付のデータ rated: falseのものは削除する
    const data = userContestInfo.contestResult
      .filter((item) => item.IsRated)
      .map((item) => ({
        rating: item.NewRating,
        date: new Date(item.EndTime),
      }));

    // 折れ線グラフを描画
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    // 日付を計算で扱えるように日数に変換する関数
    const convertDateToDays = (date: Date): number => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      return year * 365 + month * 30 + day;
    };

    // x軸: 日付, y軸: レーティング
    const x = data.map((item) => convertDateToDays(item.date));
    const y = data.map((item) => item.rating);
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);

    const xScale = (canvas.width - 100) / (xMax - xMin);
    const yScale = (canvas.height - 100) / (yMax - yMin);

    // x軸の描画
    ctx.beginPath();
    ctx.strokeStyle = "black";

    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.stroke();

    // y軸の描画
    ctx.beginPath();
    ctx.strokeStyle = "black";

    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // x軸の目盛りの描画
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.font = "12px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const xLabelCount = 5;
    const xLabelStep = Math.ceil((xMax - xMin) / xLabelCount);

    for (let i = 0; i <= xLabelCount; i++) {
      const x = i * xLabelStep * xScale + 50;
      const date = new Date(xMin + i * xLabelStep);
      ctx.moveTo(x, canvas.height - 50);
      ctx.lineTo(x, canvas.height - 45);
      ctx.fillText(
        `${date.getMonth() + 1}/${date.getDate()}`,
        x,
        canvas.height - 40
      );
    }
    ctx.stroke();

    // y軸の目盛りの描画
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.font = "12px serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const yLabelCount = 5;
    const yLabelStep = Math.ceil((yMax - yMin) / yLabelCount);

    for (let i = 0; i <= yLabelCount; i++) {
      const y = canvas.height - 50 - i * yLabelStep * yScale;
      ctx.moveTo(50, y);
      ctx.lineTo(55, y);
      ctx.fillText(`${yMin + i * yLabelStep}`, 45, y);
    }
    ctx.stroke();

    // 折れ線グラフの描画
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    for (let i = 0; i < data.length; i++) {
      const x = (convertDateToDays(data[i].date) - xMin) * xScale + 50;
      const y = (yMax - data[i].rating) * yScale + 50;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // ポイントをプロット
      ctx.beginPath();
      ctx.fillStyle = "blue";
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // 折れ線グラフのパスに戻る
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.moveTo(x, y);
    }

    // 画像を添付して送信
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "graph.png",
    });
    message.channel.send({ files: [attachment] });
  }
});

client.login(process.env.DISCORD_TOKEN);
