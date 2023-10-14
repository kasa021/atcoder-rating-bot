import axios from "axios";
import { AtCoderContestInfo } from "./interface";


const ATCODER_BASE_URL = "https://atcoder.jp/users";
const atcoderAPI = axios.create({
  baseURL: ATCODER_BASE_URL,
});

export const fetchAtCoderContestInfo = async (
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

export const addContestInfo = async (username: string, contestInfo: AtCoderContestInfo[]): Promise<string> => {
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

export const deleteContestInfo = (username: string, contestInfo: AtCoderContestInfo[]): string => {
  const index = contestInfo.findIndex((item) => item.username === username);
  if (index !== -1) {
    contestInfo.splice(index, 1);
    return `${username}の情報を削除しました`;
  } else {
    return `${username}は登録されていませんでした`;
  }
};

export const getContestInfo = (username: string, contestInfo: AtCoderContestInfo[]): AtCoderContestInfo | null => {
  const index = contestInfo.findIndex((item) => item.username === username);
  if (index !== -1) {
    return contestInfo[index];
  } else {
    return null;
  }
};