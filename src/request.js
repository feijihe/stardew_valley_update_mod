import axios from "axios";
import fs from "fs";
import ProgressBar from "progress/lib/node-progress.js";
import { cookie, game_id } from "./config.js";

export async function queryModIdByName(name) {
  const url = `https://api.nexusmods.com/mods?terms=${name}`;
  const response = await axios.get(url);

  return response.data.results[0]?.mod_id;
}

export async function getModLatestVersionInfo(modId) {
  const url = `https://www.nexusmods.com/Core/Libs/Common/Widgets/ModFilesTab?id=${modId}&game_id=${game_id}`;
  try {
    const res = await axios.get(url, {
      headers: {
        cookie: cookie,
        "x-requested-with": "XMLHttpRequest",
      },
    });

    const reg =
      /<dt id=".*?" class=".*?" data-id="(.*?)" data-name=".*?" data-size="\d+" data-version="v?(.*?)" data-date="\d+">/;

    const result = res.data.match(reg);

    return { fid: result[1], version: result[2] };
  } catch (err) {
    console.log("请检查cookie是否过期");
    console.log(err);
  }
}

export const getDownLoadModFileUrl = async (fid) => {
  const formData = `fid=${fid}&game_id=${game_id}`;
  try {
    const response = await axios.request({
      method: "post",
      maxBodyLength: Infinity,
      url: "https://www.nexusmods.com/Core/Libs/Common/Managers/Downloads?GenerateDownloadUrl",
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: cookie,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
        "x-requested-with": "XMLHttpRequest",
      },
      data: formData,
    });

    const getDownLoadFileUrl = response.data.url;

    return getDownLoadFileUrl;
  } catch (err) {
    console.log("请检查cookie是否过期");
    console.log(err);
  }
};

// 下载文件
export const downLoadModFile = async (url, path) => {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });

    const totalLength = response.headers["content-length"];

    const bar = new ProgressBar("[:bar] :percent :etas", {
      complete: "=",
      incomplete: "*",
      width: 50,
      total: parseInt(totalLength, 10),
    });

    const fileName = url.match(/\d+\/\d+\/(.*?)\?/)[1];
    const writer = fs.createWriteStream(`${path}/${fileName}`);

    response.data.on("data", (chunk) => {
      bar.tick(chunk.length);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve({ path: `${path}/${fileName}` }));
      writer.on("error", reject);
    });
  } catch (err) {
    console.log("error downLoadModFile", err, url);
    throw err;
  }
};
