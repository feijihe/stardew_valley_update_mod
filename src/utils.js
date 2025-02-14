import admZip from "adm-zip";
import fs from "fs";
import { getModLatestVersionInfo } from "./request.js";

const nameReg = /"Name": "(.*?)"/;
const versionReg = /"Version": "(.*?)"/;
const updateKeyReg = /"[N|n]exus:(.*?)"/;

/**
 * 解压文件
 * @param {string} zipPath 解压文件路径
 * @param {string} outputPath 输出路径
 */
export function unzipFile(zipPath, outputPath) {
  try {
    const zip = new admZip(zipPath);
    zip.extractAllTo(outputPath, true);
  } catch (err) {
    console.error(zipPath + "解压失败");
    console.error("err: ", err);
  }
  const zip = new admZip(zipPath);
  zip.extractAllTo(outputPath, true);
}

/**
 * 读取mod列表
 * @param {string} modsFolder  mods文件夹路径
 * @returns {Promise<Array<object>>}
 */
export function getModList(modsFolder) {
  return new Promise((resolve, reject) => {
    fs.readdir(modsFolder, (err, files) => {
      let i = 0,
        j = 0;
      const results = [];
      if (err) {
        reject(err);
        return;
      }

      while (i < files.length) {
        getModManifest(`${modsFolder}/${files[i]}`)
          .then((res) => {
            try {
              const name = res.match(nameReg)?.[1];
              const version = res.match(versionReg)?.[1];
              const modId = res.match(updateKeyReg)?.[1];

              results[j] = {
                name,
                version,
                modId,
              };
            } catch (err) {
              console.log("err: ", err);
              results[j] = res;
            }
          })
          .catch((err) => {
            console.error("err: ", err);
          })
          .finally(() => {
            j++;
            if (j == files.length) {
              resolve(results.filter((v) => v.modId));
            }
          });
        i++;
      }
    });
  });
}

/**
 * 读取mod信息
 * @param {*} path 配置文件路径
 * @returns {Promise<string>}
 */
function getModManifest(path) {
  return new Promise(async (resolve, reject) => {
    fs.readFile(`${path}/manifest.json`, "utf-8", (err, data) => {
      if (err) {
        fs.readdir(path, async (err, dirs) => {
          if (err) {
            reject(err);
            return;
          }

          for (let i = 0; i < dirs.length; i++) {
            resolve(await getModManifest(`${path}/${dirs[i]}`));
          }
        });
        return;
      }
      resolve(data);
    });
  });
}

// 检查mod版本信息
export function checkModVersion(mod) {
  return new Promise(async (resolve, reject) => {
    getModLatestVersionInfo(mod.modId)
      .then((latestMod) => {
        if (latestMod && latestMod.version !== mod.version) {
          resolve({
            name: mod.name,
            currentVersion: mod.version,
            latestVersion: latestMod.version,
            fid: latestMod.fid,
          });
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        console.error(mod.name, err);
      });
  });
}

export async function sleep(wait) {
  return new Promise((resolve) => setTimeout(resolve, wait));
}

/**
 * 删除文件
 * @param {string} filePath 文件路径
 */
export function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
