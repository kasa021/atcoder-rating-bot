import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

// selectMenuを作成する
export async function selectUsername(interaction, contestInfo) {
  // contestInfoがundefinedまたはnullでないことを確認
  if (!contestInfo) {
    console.error("contestInfo is undefined or null");
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId("select")
    .setPlaceholder("選択してください")
    .setMinValues(1)
    .setMaxValues(contestInfo.length)
    .addOptions(
      // contestInfoのユーザー名を取得して、selectMenuの選択肢にする
      contestInfo.map((info) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(info.username)
          .setValue(info.username);
      })
    );

  const row = new ActionRowBuilder().addComponents(select);

  return await interaction.reply({
    content: "ユーザーを選択してください",
    components: [row],
  });
}
