import admZip from "adm-zip";
import fs from "fs";
import { getModLatestVersionInfo } from "./request.js";

const nameReg = /"Name": "(.*?)"/;
const versionReg = /"Version": "(.*?)"/;
const updateKeyReg = /"Nexus:(.*?)"/;

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

// 读取mod列表
export function getModList(modsFolder) {
  return new Promise((resolve, reject) => {
    fs.readdir(modsFolder, (err, files) => {
      let i = 0,
        j = 0;
      const results = [];
      if (err) {
        reject(err);
      }

      while (i < files.length) {
        getModManifest(`${modsFolder}/${files[i]}/manifest.json`)
          .then((res) => {
            try {
              //   results[j] = JSON.parse(res);
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

// 读取mod信息get
function getModManifest(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        reject(err);
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
        if (latestMod.version !== mod.version) {
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
        console.error("err: ", err);
      });
  });
}

export async function sleep(wait) {
  return new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
}

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
