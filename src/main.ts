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
    console.log(data);

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

    const xLabelValues = [];
    let xLabelStep: number;

    const firstMonth = data[0].date.getMonth() + 1;
    const firstYear = data[0].date.getFullYear();
    const lastMonth = data[data.length - 1].date.getMonth() + 1;
    const lastYear = data[data.length - 1].date.getFullYear();
    const range = (lastYear - firstYear) * 12 + (lastMonth - firstMonth);
    console.log("range", range);
    console.log("firstMonth", firstMonth);
    console.log("firstYear", firstYear);
    console.log("lastMonth", lastMonth);
    console.log("lastYear", lastYear);
    if (range < 8) {
      for (let i = 0; i < range; i++) {
        const year = firstYear + Math.floor((firstMonth + i) / 12);
        const month = (firstMonth + i) % 12;
        xLabelValues.push(`${year}/${month}`);
      }
      xLabelStep = (xMax - xMin) / range;
    } else {
      for (let i = 0; i < 8; i++) {
        const year =
          firstYear + Math.floor((firstMonth + i * (range / 8)) / 12);
        const month = (firstMonth + i) % 12;
        xLabelValues.push(`${year}/${month}`);
        console.log(`${year}/${month}`);
      }
      xLabelStep = (xMax - xMin) / 8;
      console.log(xLabelStep);
    }
    const nowDate = new Date();
    const nowYear = nowDate.getFullYear();
    const nowMonth = nowDate.getMonth() + 1;
    xLabelValues.push(`${nowYear}/${nowMonth}`);

    xLabelValues.forEach((value, index) => {
      console.log(value);
      ctx.beginPath();
      const x = index * xLabelStep * xScale + 50;
      ctx.moveTo(x, canvas.height - 50);
      ctx.lineTo(x, canvas.height - 45);
      ctx.stroke(); // この行を追加
      ctx.fillText(value, x, canvas.height - 40);
    });

    // y軸の目盛りの描画
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.font = "12px serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const yLabelValues = [
      0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600,
    ];
    // 0からyMaxより一つ上のレーティングを追加
    const yLabelCount = yLabelValues.findIndex((item) => item > yMax);
    const yLabelStep = Math.ceil((yMax - yMin) / yLabelCount);

    for (let i = 0; i <= yLabelCount; i++) {
      const y = canvas.height - 50 - i * yLabelStep * yScale;
      ctx.moveTo(50, y);
      ctx.lineTo(55, y);
      ctx.fillText(yLabelValues[i].toString(), 45, y);
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
