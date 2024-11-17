1. 安装依赖

```
pnpm install
```

2. 更新配置
修改 `config.js` 中 `MODS_FOLDER` 和 `cookie` 的配置
```js
export const game_id = 1303; // 游戏ID 例如 1303 星露谷 1304 星铁
export const isDel = true; // 解压之后是否删除压缩包

export const MODS_FOLDER = ""; // 游戏MOD文件夹路径 例如 D:/Steam/steamapps/common/Stardew Valley/Mods
export const cookie = ""; // n网的cookie  登录n网获取
```

3. 运行

```
node index.js
```

或者双击运行 `auto.update_mod.bat`