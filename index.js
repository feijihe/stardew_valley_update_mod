import { getDownLoadModFileUrl, downLoadModFile } from "./src/request.js";
import {
  unzipFile,
  getModList,
  checkModVersion,
  deleteFile,
  sleep,
} from "./src/utils.js";
import { MODS_FOLDER, isDel } from "./src/config.js";


// 读取mod列表
console.log(" 开始读取已安装mod列表");
getModList(MODS_FOLDER).then(async (modInfoList) => {
  console.log(
    " 读取已安装mod列表完成",
    modInfoList.map((mod) => mod.name)
  );
  console.log("检查已安装mod版本是否有更新");
  const results = await Promise.all(modInfoList.map(checkModVersion));
  const needUpdateMod = results.filter((mod) => !!mod);
  console.log(
    "需要更新的mod",
    needUpdateMod.map((mod) => mod.name)
  );

  if (needUpdateMod.length === 0) {
    console.log("没有需要更新的mod");
    return;
  }

  const downLoadModFiles = [];

  console.log("开始获取需要更新的mod下载地址");
  const promiseAll = needUpdateMod.map((mod, i) =>
    getDownLoadModFileUrl(mod.fid).then((url) => {
      console.log('\n' + url)
      console.log(mod.name + "开始下载, 下载完成后会自动解压");
      return downLoadModFile(url, MODS_FOLDER).then(({ path }) => {
        downLoadModFiles[i] = path;
        console.log("下载完成 ===> " + path + " ===> 开始解压");
        unzipFile(path, MODS_FOLDER);
      });
    })
  );

  await Promise.all(promiseAll);

  if (isDel) {
    await sleep(1000);
    console.log("解压完成， 开始删除压缩包");
    await Promise.all(downLoadModFiles.map((path) => deleteFile(path)));
    console.log("删除完成");
  }

  console.log("更新完成，检查是否生效");
}).catch(err => {
  throw err
});
